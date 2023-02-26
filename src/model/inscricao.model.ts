import { prop, Ref, modelOptions, post, DocumentType } from "@typegoose/typegoose";
import { Periodo } from "../schema/periodo.schema";
import { Participante } from "./participante.model";
import { Operador } from "./operador.model";
import QRCode from "qrcode";
import { Types } from "mongoose";

@post<Inscricao>("save", async function() {
    if(!this.confirmada && !this.qrCode) {
        this.qrCode = await QRCode.toDataURL(this._id);
        this.save();
    }
})
@modelOptions({ schemaOptions: { timestamps: true } })
class Inscricao {
    @prop({ required: true, type: [Periodo] })
    public periodo!: Types.Array<Periodo>;

    @prop()
    public qrCode?: string;

    @prop({ required: true, ref: () => Participante })
    public participante!: Ref<Participante>;

    @prop({ default: false })
    public confirmada!: boolean;

    @prop({ required: true, ref: () => Operador })
    public confirmadaPor!: Ref<Operador>;


    public async confirmarParticipacao(this: DocumentType<Inscricao>, idOperador: string) {
        this.confirmadaPor._id = idOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        this.save();
    }
}

export { Inscricao };