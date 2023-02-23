import { EventoModel, InstituicaoModel } from "../model/models";
import { Request, Response } from "express";
import { InscricaoModel } from "../model/models";

export default abstract class InscricaoController {

    static async confirmar(req: Request, res: Response) {
        const idInscricao = req.params.id;
        const instituicao = InstituicaoModel.findOne({ "operadores._id": res.locals.userId });
        
        if(!instituicao)
            return res.json({ msg: "Não autorizado" });
        
        const evento = EventoModel.findOne({ "inscricoes._id": idInscricao });
        const inscricao = await InscricaoModel.findById(idInscricao);
        if(!evento || !inscricao)
            return res.json({ msg: "Inscricão inválida, contate seu gestor" });
        
        try {
            await inscricao.confirmarParticipacao(res.locals.userId);
        } catch (err) {
            res.json({ msg: "Não foi possível confirmar esta inscrição de evento, tente novamente. ", erro: true, detalhes: err });
        }
    }
}