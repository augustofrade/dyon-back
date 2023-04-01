import { Request, Response } from "express";

import { AvaliacaoModel, EventoModel, InscricaoModel } from "../model/models";
import { IAvaliacao } from "../types/interface";

export default abstract class AvaliacaoController {

    public static async novaAvaliacao(req: Request<unknown, unknown, IAvaliacao>, res: Response) {
        const evento = await EventoModel.findById(req.body.idEvento);
        if(!evento)
            return res.status(400).json({ msg: "Evento não encontrado", erro: true });

        const inscricaoExistente = await InscricaoModel.buscarInscricao(req.userId!, req.body.idEvento, true);
        if(inscricaoExistente === null)
            return res.status(400).json({ msg: "Você não pode avaliar um evento que não participou", erro: true });

        const avaliacaoExistente = await AvaliacaoModel.buscarAvaliacaoEvento(req.userId!, req.body.idEvento);
        if(avaliacaoExistente)
            return res.status(400).json({ msg: "Você não pode avaliar um evento mais de uma vez", erro: true });
        
        try {
            const dataParticipacao = inscricaoExistente.inscricao.dataParticipacao;
            await AvaliacaoModel.novaAvaliacao(req.participante!, { ... req.body, evento, dataParticipacao });
            res.json({ msg: "Sua avaliação deste evento foi salva com sucesso" });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao salvar sua avaliação, tente novamente", erro: true });
        }
    }

    public static async editarAvaliacao(req: Request, res: Response) {
        const avaliacao = await AvaliacaoModel.findById(req.params.idAvaliacao);
        if(!avaliacao)
            return res.status(400).json({ msg: "A avaliação não existe", erro: true });
        if(avaliacao.autor.idUsuario !== req.userId)
            return res.status(400).json({ msg: "Não autorizado: você não é o autor desta avaliação", erro: true });

        const nota: number = req.body.nota,
            comentario: string | undefined = req.body.comentario;
        try {
            await AvaliacaoModel.editarAvaliacao(avaliacao._id, { nota, comentario });
            res.json({ msg: "Sua avaliação foi editada com sucesso" });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao editar sua avaliação, tente novamente", erro: true });
        }
    }


    // TODO: método para listar avaliações de um usuário e exclusão de avaliação

    
}