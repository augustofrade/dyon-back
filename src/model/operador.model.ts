import { prop } from "@typegoose/typegoose";

class Operador {
    @prop({ required: true })
    public nomeCompleto!: string;

    @prop({ required: true })
    public telefone!: string;

    @prop({ required: true, default: true })
    public ativo!: boolean;
}

export { Operador };