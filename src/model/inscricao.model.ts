import { DocumentType, modelOptions, post, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import QRCode from "qrcode";

import { IdentificacaoEvento } from "../schema/identificacaoEvento.schema";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { ParticipanteQuery } from "../types/types";
import { HistoricoInscricaoModel } from "./historicoInscricao.model";
import { Periodo } from "./periodo.model";


@post<Inscricao>("save", async function() {
    if(!this.confirmada && !this.qrCode) {
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

    @prop({ required: true })
    public participante!: IdentificacaoUsuario;

    @prop({ default: false })
    public confirmada!: boolean;

    @prop({ default: false })
    public cancelada!: boolean;

    @prop()
    public confirmadaPor?: string; 

    @prop({ required: true })
    public evento!: IdentificacaoEvento;


    public async confirmarParticipacao(this: DocumentType<Inscricao>,
        dados: { nomeOperador: string, participante: ParticipanteQuery, instituicao: IdentificacaoUsuario }) {
        this.confirmadaPor = dados.nomeOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        await this.save();
        
        await HistoricoInscricaoModel.create({
            evento: {
                titulo: this.evento.titulo,
                idEvento: this.evento.idEvento,
                instituicao: this.evento.instituicao
            },
            participante: IdentificacaoUsuario.gerarIdentificacao(dados.participante),
            instituicao: dados.instituicao
        });
    }

    public static listarPorPeriodoEvento(this: ReturnModelType<typeof Inscricao>, idEvento: string) {
        return this.find({ evento: idEvento }).select("participante confirmada -_id");
    }

    public static async usuarioJaInscrito(this: ReturnModelType<typeof Inscricao>, idUsuario: string, idPeriodo: string): Promise<boolean> {
        const doc = await this.findOne({ "participante.idUsuario": idUsuario, "periodo": idPeriodo });
        return !!doc;
    }

    public static dadosInscricao(this: ReturnModelType<typeof Inscricao>, idInscricao: string) {
        return this.findById(idInscricao).populate("periodo", "inicio termino cancelado");
    }
}

export { Inscricao };