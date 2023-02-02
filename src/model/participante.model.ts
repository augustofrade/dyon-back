import { generoEnum } from "./../types/enums";
import { prop, getDiscriminatorModelForClass, Ref } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { Usuario, UsuarioModel } from "./usuario.model";
import { Categoria } from "./categoria.model";
import { Instituicao } from "./instituicao.model";
import { Evento } from "./evento.model";
import { Inscricao } from "./inscricao.model";

class Participante extends Usuario {

    @prop({ required: true })
    public nomeCompleto!: string;

    @prop()
    public nomeSocial?: string;

    @prop({ required: true, enum: generoEnum })
    public genero!: string;

    @prop({ required: true })
    public cpf!: string;

    @prop({ required: true })
    public dataNascimento!: Date;

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], ref: () => Categoria })
    public categoriasFavoritas!: Ref<Categoria>[];

    @prop({ default: [], ref: () => Instituicao })
    public seguindo!: Ref<Instituicao>[];

    @prop({ default: [], ref: () => Evento })
    public acompanhando!: Ref<Evento>[];

    @prop({ default: [], ref: () => Inscricao })
    public inscricoes!: Ref<Inscricao>[];
}

const ParticipanteModel = getDiscriminatorModelForClass(UsuarioModel, Participante);

export { ParticipanteModel, Participante };