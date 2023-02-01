import { prop, getDiscriminatorModelForClass } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { Usuario, UsuarioModel } from "./usuario.model";

class Participante extends Usuario {
    @prop({ required: true })
    public nomeCompleto!: string;

    @prop({ required: true })
    public cpf!: string;

    @prop({ required: true })
    public endereco!: Endereco;
}

const ParticipanteModel = getDiscriminatorModelForClass(UsuarioModel, Participante);

export { ParticipanteModel, Participante };