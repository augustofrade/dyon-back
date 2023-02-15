import { prop } from "@typegoose/typegoose";

class Operador {
    @prop({ required: true, minlength: 10, maxLength: 50 })
    public nomeCompleto!: string;

    @prop({ required: true, minLength: 9, maxLength: 15 })
    public telefone!: string;

    @prop({ required: true, default: true })
    public ativo!: boolean;
}

export { Operador };