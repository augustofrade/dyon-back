import { DocumentType, modelOptions, post, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import QRCode from "qrcode";

import { Periodo } from "./periodo.model";
import { Evento } from "./evento.model";
import { Participante } from "./participante.model";

@post<Inscricao>("save", async function() {
    if(!this.confirmada && !this.qrCode) {
        console.log(this._id.toString());
        this.qrCode = await QRCode.toDataURL(this._id.toString());
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

    @prop({ default: false})
    public cancelada!: boolean;

    @prop()
    public confirmadaPor?: string; 

    @prop({ required: true, ref: () => Evento })
    public evento!: Ref<Evento>;


    public async confirmarParticipacao(this: DocumentType<Inscricao>, nomeOperador: string) {
        this.confirmadaPor = nomeOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        this.save();
    }

    public static listarPorPeriodoEvento(this: ReturnModelType<typeof Inscricao>, idEvento: string) {
        return this.find({ evento: idEvento }).select("participante confirmada -__v -_id").populate("participante", "nomeCompleto");
    }
}

export { Inscricao };