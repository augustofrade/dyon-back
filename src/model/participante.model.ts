import { generoEnum } from "./../types/enums";
import { prop, Ref, pre, ReturnModelType } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { Usuario } from "./usuario.model";
import { Categoria } from "./categoria.model";
import { Instituicao } from "./instituicao.model";
import { Evento } from "./evento.model";
import { Inscricao } from "./inscricao.model";
import gerarUsername from "../util/gerarUsername";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import { Types } from "mongoose";


const configsPadrao = () => ({
    exibirInscricoes: true,
    exibirCategorias: true,
    exibirSeguindo: true,
    exibirHistorico: true
});


@pre<Participante>("save", function() {
    if(this.isModified("nomeSocial") || this.isModified("nomeCompleto")) {
        this.username = gerarUsername(this.nomeSocial ?? this.nomeCompleto);
    }
})
class Participante extends Usuario {

    @prop({ required: true, minLength: 10, maxLength: 60 })
    public nomeCompleto!: string;

    @prop()
    public nomeSocial?: string;

    @prop()
    public fotoPerfil?: Buffer;

    @prop({ required: true, enum: generoEnum })
    public genero!: string;

    @prop({ required: true, minLength: 14, maxLength: 14 })
    public cpf!: string;

    @prop({ required: true })
    public dataNascimento!: Date;

    @prop({ default: () => configsPadrao() })
    public configuracoes!: PerfilConfig;

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], type: [Categoria] })
    public categoriasFavoritas!: Types.Array<Categoria>;

    @prop({ default: [], ref: () => Instituicao })
    public seguindo!: Ref<Instituicao>[];

    @prop({ default: [], ref: () => Evento })
    public acompanhando!: Ref<Evento>[];

    @prop({ default: [], ref: () => Inscricao })
    public inscricoes!: Ref<Inscricao>[];

    static obterDadosPerfil(this: ReturnModelType<typeof Participante>, username: string) {
        return this.findOne({ username })
        .select("-_id -tipo fotoPerfil nomeCompleto nomeSocial createdAt categoriasFavoritas inscricoes acompanhando")
        .populate({
            path: "inscricoes",
            select: "periodo evento",
            populate: {
                path: "evento",
                select: "-_id titulo endereco _publicId slug"
            }
        })
        .populate("acompanhando", "-_id titulo endereco publicId slug visivel periodosOcorrencia");
    }

    static atualizarPerfil(this: ReturnModelType<typeof Participante>, idUsuario: string, dados: Record<string, string>, fotoPerfil: Buffer | undefined) {
        const nome: string | undefined = dados.nomeSocial ?? dados.nomeCompleto;
        const username: string | undefined = nome ? gerarUsername(nome) : undefined;

        let configuracoesValidadas: Record<string, boolean> | undefined = undefined;
        if(dados.configuracoes) {

            const configuracoes: Record<string, boolean> = JSON.parse(dados.configuracoes);
            configuracoesValidadas = {
                exibirInscricoes: configuracoes.exibirInscricoes ?? true,
                exibirCategorias: configuracoes.exibirCategorias ?? true,
                exibirSeguindo: configuracoes.exibirSeguindo ?? true,
                exibirHistorico: configuracoes.exibirHistorico ?? true
            };
        }

        return this.findByIdAndUpdate(idUsuario, {
            $set: { ...dados, username, fotoPerfil, configuracoes: configuracoesValidadas }
        }, { new: true }).select("-senha -_id -__v -emailToken -refreshToken -acompanhando -inscricoes -updatedAt");
    }
}

export { Participante };