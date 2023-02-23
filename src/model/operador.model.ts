import { prop, Ref } from "@typegoose/typegoose";
import { Instituicao } from "./instituicao.model";

class Operador {
    @prop({ required: true, minlength: 10, maxLength: 50 })
    public nomeCompleto!: string;

    @prop({ required: true, minLength: 9, maxLength: 15 })
    public telefone!: string;

    @prop({ required: true, default: true })
    public ativo!: boolean;

    @prop({ required: true, ref: () => Instituicao })
    public instituicao!: Ref<Instituicao>;
}

export { Operador };