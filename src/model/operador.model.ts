import { prop } from "@typegoose/typegoose";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { Usuario } from "./usuario.model";

class Operador extends Usuario {
    @prop({ required: true, minlength: 10, maxLength: 50 })
    public nomeCompleto!: string;

    @prop({ required: true, minLength: 9, maxLength: 15 })
    public telefone!: string;

    @prop({ required: true, default: true })
    public ativo!: boolean;

    @prop({ required: true })
    public instituicao!: IdentificacaoUsuario;
}

export { Operador };