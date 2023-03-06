import { modelOptions, Ref, prop } from "@typegoose/typegoose";
import { Participante } from "./participante.model";

@modelOptions({ schemaOptions: { timestamps: true } })
class Avaliacao {
    @prop({ required: true, ref: () => Participante })
    public autor!: Ref<Participante>;

    @prop({ required: true, min: 0, max: 10 })
    public nota!: number;

    @prop()
    public comentario?: string;

    @prop()
    public nomeEvento!: string;

    @prop()
    public dataEvento!: Date;
}

export { Avaliacao };