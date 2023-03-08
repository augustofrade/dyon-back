import { DocumentType, modelOptions, post, prop, Ref } from "@typegoose/typegoose";
import { Types } from "mongoose";
import QRCode from "qrcode";

import { Periodo } from "./periodo.model";
import { Evento } from "./evento.model";
import { Operador } from "./operador.model";
import { Participante } from "./participante.model";

@post<Inscricao>("save", async function() {
    if(!this.confirmada && !this.qrCode) {
        this.qrCode = await QRCode.toDataURL(this._id);
        this.save();
    }
})
@modelOptions({ schemaOptions: { timestamps: true } })
class Inscricao {
    @prop({ required: true, ref: () => Periodo })
    public periodo!: Ref<Periodo>;

    @prop()
    public qrCode?: string;

    @prop({ required: true, ref: () => Participante })
    public participante!: Ref<Participante>;

    @prop({ default: false })
    public confirmada!: boolean;

    @prop({ ref: () => Operador })
    public confirmadaPor?: Ref<Operador>;

    @prop({ required: true, ref: () => Evento })
    public evento!: Ref<Evento>;


    public async confirmarParticipacao(this: DocumentType<Inscricao>, idOperador: string) {
        this.confirmadaPor!._id = idOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        this.save();
    }
}

export { Inscricao };