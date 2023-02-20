import { generoEnum } from "./../types/enums";
import { prop, Ref, pre } from "@typegoose/typegoose";
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
    if(this.isModified("nomeSocial" || this.isModified("nomeCompleto"))) {
        this.username = gerarUsername( this.nomeSocial ?? this.nomeCompleto);
    }
})
class Participante extends Usuario {

    @prop({ required: true, minLength: 10, maxLength: 60 })
    public nomeCompleto!: string;

    @prop()
    public nomeSocial?: string;

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
}

export { Participante };