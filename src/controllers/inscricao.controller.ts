import { IPeriodo } from "./../types/interface";
import { Request, Response } from "express";
import { InscricaoModel, ParticipanteModel, EventoModel, InstituicaoModel } from "../model/models";

export default abstract class InscricaoController {

    static async novaInscricao(req: Request, res: Response) {
        const participante = await ParticipanteModel.findById(res.locals.userId);
        if(!participante)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const evento = await EventoModel.findById(req.body.idEvento);
        if(!evento)
            return res.json({ msg: "ID de Evento inválido", erro: true });

        const periodo: IPeriodo = req.body.periodo;

        try {
            const inscricao = new InscricaoModel({ participante: res.locals.userId, periodo });
            inscricao.save();
            res.status(200).json({ msg: "Inscrição realizada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível realizar sua inscrição neste evento, tente novamente.", erro: true, detalhes: err });
        }
    }

    static async cancelarInscricao(req: Request, res: Response) {
        
    }

    static async confirmarInscricao(req: Request, res: Response) {
        const idInscricao = req.params.id;
        const instituicao = InstituicaoModel.findOne({ "operadores._id": res.locals.userId });
        
        if(!instituicao)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const evento = EventoModel.findOne({ "inscricoes._id": idInscricao });
        const inscricao = await InscricaoModel.findById(idInscricao);
        if(!evento || !inscricao)
            return res.json({ msg: "Inscricão inválida, contate seu gestor", erro: true });
        
        try {
            await inscricao.confirmarParticipacao(res.locals.userId);
            res.status(201).json({ msg: "Inscrição confirmada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível confirmar esta inscrição de evento, tente novamente. ", erro: true, detalhes: err });
        }
    }
}