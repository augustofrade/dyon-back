/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { OperadorModel, PeriodoModel } from "./../model/models";
import { IResumoInscricao } from "./../types/interface";
import { Request, Response } from "express";
import { InscricaoModel, ParticipanteModel, EventoModel, InstituicaoModel } from "../model/models";
import { Inscricao } from "../model/inscricao.model";
import { Participante } from "../model/participante.model";

export default abstract class InscricaoController {

    static async novaInscricao(req: Request, res: Response) {
        const participante = await ParticipanteModel.findById(req.userId);
        if(!participante)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const evento = await EventoModel.findById(req.body.idEvento);
        if(!evento)
            return res.json({ msg: "ID de Evento inválido", erro: true });

        try {
            const periodo = await PeriodoModel.findById(req.body.idPeriodo);
            if(!periodo) throw new Error();
            if(await periodo.limiteInscricoesAtingido())
                return res.json({ msg: "Não foi possível realizar sua inscrição neste evento, pois não há mais inscrições disponíveis." });
            const inscricao = new InscricaoModel({ participante: req.userId, periodo, evento: evento._id });
            await inscricao.save();
            participante.inscricoes.push(inscricao._id);
            await participante.save();
            evento.inscricoes.push(inscricao._id);
            await evento.save();
            res.status(200).json({ msg: "Inscrição realizada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível realizar sua inscrição neste evento, tente novamente.", erro: true, detalhes: err });
        }
    }

    static async cancelarInscricao(req: Request, res: Response) {
        const idInscricao = req.body.idInscricao;
        const participante = await ParticipanteModel.findById(req.userId);
        const inscricao = await InscricaoModel.findById(idInscricao);
        if(!participante || !inscricao || inscricao.participante._id !== participante._id)
            return res.json({ msg: "Não autorizado", erro: true });
        else if(inscricao.confirmada)
            return res.json({ msg: "Não é possível cancelar uma inscrição após ela já estar confirmada", erro: true });

        try {
            await ParticipanteModel.findByIdAndUpdate(req.userId, { $pull: { inscricoes: idInscricao } });
            await EventoModel.findByIdAndUpdate(inscricao.evento._id, { $pull: { inscricoes: idInscricao } });
            await InscricaoModel.findByIdAndDelete(inscricao._id);
            res.status(200).json({ msg: "Inscrição cancelada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível cancelar sua inscrição neste evento", erro: true, detalhes: err });
        }
    }

    static async confirmarInscricao(req: Request, res: Response) {
        // Operador
        const idInscricao = req.params.idInscricao;
        const instituicaoOperador = InstituicaoModel.findOne({ "operadores._id": req.userId });
        
        if(!instituicaoOperador)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const operador = await OperadorModel.findById(req.userId);
        const evento = EventoModel.findOne({ "inscricoes._id": idInscricao });
        const inscricao = await InscricaoModel.findById(idInscricao);
        if(!evento || !inscricao)
            return res.json({ msg: "Inscricão inválida, contate seu gestor", erro: true });
        
        try {
            await inscricao.confirmarParticipacao(operador!.nomeCompleto);
            res.status(201).json({ msg: "Inscrição confirmada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível confirmar esta inscrição de evento, tente novamente. ", erro: true, detalhes: err });
        }
    }

    static async listarPorPeriodoEvento(req: Request, res: Response) {
        try {
            const inscricoesRaw = await InscricaoModel.listarPorPeriodoEvento(req.params.idPeriodo);
            if(!inscricoesRaw)
                throw new Error();
            const inscricoes: Array<IResumoInscricao> = inscricoesRaw.map((i: Inscricao) =>
                ({ confirmada: i.confirmada, nomeUsuario: (<Participante>i.participante).nomeCompleto })
            );
            return res.json(inscricoes);
        } catch (err) {
            return res.json({ msg: "Não foi possível buscar as inscrições para esta ocorrência deste evento, tente novamente", erro: true });
        }
    }
}