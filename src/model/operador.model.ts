import { prop, getDiscriminatorModelForClass } from "@typegoose/typegoose";
import { UsuarioModel } from "./usuario.model";

class Operador {
    @prop({ required: true })
    public nomeCompleto!: string;

    @prop({ required: true })
    public telefone!: string;

    @prop({ required: true, default: true })
    public ativo!: boolean;
}

const OperadorModel = getDiscriminatorModelForClass(UsuarioModel, Operador);

export { OperadorModel, Operador };