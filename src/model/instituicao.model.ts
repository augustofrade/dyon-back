import { IInstituicaoConfig } from "../types/interface";
import { DocumentType, pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";

import { Endereco } from "../schema/endereco.schema";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import { Categoria } from "./categoria.model";
import { Evento } from "./evento.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";
import { Types } from "mongoose";
import gerarUsername from "../util/gerarUsername";
import { Avaliacao } from "./avaliacao.model";


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
    public cnpj!: string;

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
            .select("-_id -senha -email -emailConfirmado -emailToken -refreshToken -tipo -nomeRepresentante -operadores -cnpj -configuracoes -telefone -updatedAt -__v")
            .populate("eventos", "-_id titulo endereco publicId slug visivel periodosOcorrencia")
            .populate("avaliacoes");
    }

    public static atualizarPerfil(this: ReturnModelType<typeof Instituicao>, idUsuario: string, dados: Record<string, string>, fotoPerfil: Buffer | undefined) {
        const username: string | undefined = dados.nomeFantasia ? gerarUsername(dados.nomeFantasia) : undefined;

        let configuracoesValidadas: Record<string, boolean> | undefined = undefined;
        if(dados.configuracoes) {

            const configuracoes: Record<string, boolean> = JSON.parse(dados.configuracoes);
            configuracoesValidadas = {
                exibirEndereco: configuracoes.exibirInscricoes ?? true
            };
        }

        return this.findByIdAndUpdate(idUsuario, {
            $set: { ...dados, username, fotoPerfil, configuracoes: configuracoesValidadas }
        }, { new: true }).select("-senha -_id -__v -emailToken -refreshToken -operadores -eventos -updatedAt");
    }

    public avaliacaoMedia(this: DocumentType<Instituicao>) : string {
        let media = 0;
        if(this.populated("avaliacoes")) {
            media = (<Avaliacao[]>this.avaliacoes).reduce((valor: number, avaliacao: Avaliacao) => valor + avaliacao.nota, 0);
            media = media / this.avaliacoes.length;
        }
        return media.toFixed(2);
    }

    public static obterEndereco(this: ReturnModelType<typeof Instituicao>, id: string) {
        return this.findById(id).select("endereco -tipo -_id");
    }

    public async removerEvento(this: DocumentType<Instituicao>, idEvento: string) {
        this.eventos = this.eventos.filter(e => e._id != idEvento);
        return this.save();
    }
}


export { Instituicao };