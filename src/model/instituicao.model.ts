import { prop, getDiscriminatorModelForClass } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { Usuario, UsuarioModel } from "./usuario.model";

class Instituicao extends Usuario {
    @prop({ required: true })
    public nomeFantasia!: string;

    @prop({ required: true })
    public sigla!: string;

    @prop({ required: true })
    public endereco!: Endereco;
}

const InstituicaoModel = getDiscriminatorModelForClass(UsuarioModel, Instituicao);

export { InstituicaoModel, Instituicao };