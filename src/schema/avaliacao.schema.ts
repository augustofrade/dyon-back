import { modelOptions, Ref, prop } from "@typegoose/typegoose";
import { Usuario } from "../model/usuario.model";

@modelOptions({ schemaOptions: { timestamps: true } })
class Avaliacao {
    @prop({ required: true, ref: () => Usuario })
    public autor!: Ref<Usuario>;

    @prop({ required: true, min: 0, max: 10 })
    public nota!: number;

    @prop()
    public comentario?: string;
}

export { Avaliacao };