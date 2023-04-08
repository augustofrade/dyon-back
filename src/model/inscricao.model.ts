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

    @prop()
    public dataParticipacao!: Date;


    public async confirmarParticipacao(this: DocumentType<Inscricao>,
        dados: { nomeOperador: string, participante: ParticipanteQuery, instituicao: IdentificacaoUsuario }) {
        this.confirmadaPor = dados.nomeOperador;
        this.qrCode = undefined;
        this.confirmada = true;
        this.dataParticipacao = new Date();
        await this.save();
        
        await HistoricoInscricaoModel.create({
            evento: {
                titulo: this.evento.titulo,
                idEvento: this.evento.idEvento,
                instituicao: this.evento.instituicao,
            },
            participante: IdentificacaoUsuario.gerarIdentificacao(dados.participante),
            instituicao: dados.instituicao,
            dataParticipacao: this.dataParticipacao
        });
    }

    public static listarPorPeriodoEvento(this: ReturnModelType<typeof Inscricao>, idEvento: string) {
        return this.find({ "evento._id": idEvento }).select("participante confirmada -_id");
    }

    public static async usuarioJaInscrito(this: ReturnModelType<typeof Inscricao>, idUsuario: string, idPeriodo: string): Promise<boolean> {
        const doc = await this.findOne({ "participante.idUsuario": idUsuario, "periodo": idPeriodo });
        return !!doc;
    }

    public static dadosInscricao(this: ReturnModelType<typeof Inscricao>, idInscricao: string) {
        return this.findById(idInscricao).populate("periodo", "inicio termino cancelado");
    }

    public static async buscarInscricaoEvento(this: ReturnModelType<typeof Inscricao>,
        idUsuario: string, idEvento: string, buscarHistorico = false) {
        // verifica se o participante já participou alguma vez em tal evento
        const inscricao = await this.findOne({
            "participante.idUsuario": idUsuario,
            "evento._id": idEvento,
            "confirmada": true
        });
        if(inscricao)
            return { inscricao, noHistorico: false };
        else if(buscarHistorico) {
            // inscrição não encontrada, mas pode estar no histórico do participante
            const historico = await HistoricoInscricaoModel.buscarInscricao(idUsuario, idEvento);
            return historico ? { inscricao: historico, noHistorico: true } : null;
        } else {
            return null;
        }
    }

    public static buscarInscricao(this: ReturnModelType<typeof Inscricao>, idInscricao: string) {
        return this.findById(idInscricao)
            .select("-_id -__v -createdAt -updatedAt -confirmadaPor -participante")
            .populate({
                path: "periodo",
                select: "-_id -__v -evento",
            });
    }
}

export { Inscricao };