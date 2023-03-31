import { DocumentType, modelOptions, post, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import QRCode from "qrcode";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { ParticipanteQuery } from "../types/types";
import { Evento } from "./evento.model";
import { HistoricoInscricaoModel } from "./HistoricoInscricao.model";
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

    @prop({ default: false})
    public cancelada!: boolean;

    @prop()
    public confirmadaPor?: string; 

    // TODO: avaliar se é melhor criar um subdoc para identificação do evento para otimização da consulta (remover um populate)
    @prop({ required: true, ref: () => Evento })
    public evento!: Ref<Evento>;


    public async confirmarParticipacao(this: DocumentType<Inscricao>,
        dados: { nomeOperador: string, nomeEvento: string, participante: ParticipanteQuery, instituicao: IdentificacaoUsuario }) {
        // TODO: trocar nomeEvento por IdentificacaoEvento.titulo
        this.confirmadaPor = dados.nomeOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        await this.save();
        await HistoricoInscricaoModel.create({
            nomeEvento: dados.nomeEvento,
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
        return this.findById(idInscricao).populate("periodo", "inicio termino cancelado").populate("evento", "titulo");
    }
}

export { Inscricao };