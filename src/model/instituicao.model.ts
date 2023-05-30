import { DocumentType, pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";

import { Endereco } from "../schema/endereco.schema";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import { fotoPerfilEnum } from "../types/enums";
import { IInstituicaoConfig } from "../types/interface";
import { comprimirImagem } from "../util/comprimirImagem";
import gerarUsername from "../util/gerarUsername";
import { Avaliacao } from "./avaliacao.model";
import { Categoria } from "./categoria.model";
import { Evento } from "./evento.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";


const configsPadrao = (): IInstituicaoConfig => ({ exibirEndereco: true });


@pre<Instituicao>("save", function() {
    if(this.isModified("nomeFantasia")) {
        this.username = gerarUsername(this.nomeFantasia);
    }
})
class Instituicao extends Usuario {
    @prop({ required: true, minlength: 3, maxLength: 40 })
    public nomeFantasia!: string;

    @prop({ required: true, maxLength: 80 })
    public nomeRepresentante!: string;

    @prop()
    public fotoPerfil?: Buffer;

    @prop({ required: true,  })
    public documento!: string;

    @prop({ default: () => configsPadrao() })
    public configuracoes!: PerfilConfig;

    @prop({ required: true, minlength: 10, maxlength: 16 })
    public telefone!: string;

    @prop({ required: true, default: [], type: [Categoria] })
    public categoriasRamo!: Types.Array<Categoria>;

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], ref: () => Operador })
    public operadores!: Ref<Operador>[];

    @prop({ default: [], ref: () => Evento })
    public eventos!: Ref<Evento>[];

    @prop({ default: [], ref: () => Avaliacao })
    public avaliacoes!: Ref<Avaliacao>[];

    public static obterDadosPerfil(this: ReturnModelType<typeof Instituicao>, username: string) {
        return this.findOne({ username })
            .select("-senha -email -emailConfirmado -emailToken -senhaToken -refreshToken -tipo -nomeRepresentante -operadores -documento -configuracoes -telefone -updatedAt -__v")
            .populate({
                path: "eventos",
                select: "_id titulo cancelado banner endereco _publicId slug visivel periodosOcorrencia",
                populate: "periodosOcorrencia"
            })
            .populate("avaliacoes");
    }

    public static async atualizarPerfil(this: ReturnModelType<typeof Instituicao>, idUsuario: string, dados: Record<string, string>, fotoPerfil: Buffer | undefined) {
        const username: string | undefined = dados.nomeFantasia ? gerarUsername(dados.nomeFantasia) : undefined;
        if(fotoPerfil !== undefined)
                fotoPerfil = await comprimirImagem(fotoPerfil, fotoPerfilEnum.largura, fotoPerfilEnum.altura);

        let configuracoesValidadas: Record<string, boolean> | undefined = undefined;
        if(dados.configuracoes) {

            const configuracoes: Record<string, boolean> = JSON.parse(dados.configuracoes);
            configuracoesValidadas = {
                exibirEndereco: configuracoes.exibirInscricoes ?? true
            };
        }

        return this.findByIdAndUpdate(idUsuario, {
            $set: { ...dados, username, fotoPerfil, configuracoes: configuracoesValidadas }
        }, { new: true }).select("-senha -_id -__v -emailToken -senhaToken -refreshToken -operadores -eventos -updatedAt");
    }

    public avaliacaoMedia(this: DocumentType<Instituicao>) : number {
        let media = 0;
        if(this.populated("avaliacoes")) {
            media = (<Avaliacao[]>this.avaliacoes).reduce((valor: number, avaliacao: Avaliacao) => valor + avaliacao.nota, 0);
            media = media / this.avaliacoes.length;
            if(isNaN(media))
                media = 0;
        }
        return media;
    }

    public adicionarEvento(this: DocumentType<Instituicao>, idEvento: string) {
        this.eventos.push(idEvento as any);
        return this.save();
    }

    public removerEvento(this: DocumentType<Instituicao>, idEvento: string) {
        this.eventos = this.eventos.filter(e => e._id != idEvento);
        return this.save();
    }

    public adicionarAvaliacao(this: DocumentType<Instituicao>, idAvaliacao: string) {
        this.avaliacoes.push(idAvaliacao as any);
        return this.save();
    }
}


export { Instituicao };