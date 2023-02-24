import { EventoModel } from "../model/models";
import { Request, Response } from "express";

export default abstract class AvaliacaoController {
    
    public static async avaliacoesEvento(req: Request, res: Response) {
        const comentarios = await EventoModel.avaliacoesPorId(req.params.idEvento);
        res.json(comentarios);
    }
}