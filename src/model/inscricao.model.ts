import { prop, pre, Ref, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { Periodo } from "../schema/periodo.schema";
import { Participante } from "./participante.model";
import { Operador } from "./operador.model";

@pre<Inscricao>("save", function() {
    // TODO: Adicionar geração de QR Code
})
@modelOptions({ schemaOptions: { timestamps: true } })
class Inscricao {
    @prop({ required: true, ref: () => Periodo })
    public periodo!: Ref<Periodo>;

    @prop()
    public qrCode!: string;

    @prop({ required: true, ref: () => Participante })
    public participante!: Ref<Participante>;

    @prop({ default: false })
    public confirmada!: boolean;

    @prop({ required: true, ref: () => Operador })
    public confirmadaPor!: Ref<Operador>;
}

const InscricaoModel = getModelForClass(Inscricao);

export { InscricaoModel, Inscricao };