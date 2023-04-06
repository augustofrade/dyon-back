import { Request, Response } from "express";

import { Avaliacao } from "../model/avaliacao.model";
import { Instituicao } from "../model/instituicao.model";
import { AvaliacaoModel, EventoModel, InscricaoModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";
import { usuariosEnum } from "../types/enums";
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

    public static async listarAvaliacoes(req: Request, res: Response) {
        try {
            const { idUsuario } = req.params;
            const usuario = await UsuarioModel.findById(idUsuario);
            if(!usuario)
                return res.json({ msg: "Usuário não encontrado", erro: true });
            
            if(usuario.tipo === usuariosEnum.Instituicao) {
                await usuario.populate("avaliacoes");
                const avaliacoes = (usuario as unknown as Instituicao).avaliacoes as Avaliacao[];
                return res.status(200).json({ dados: avaliacoes });
            } else if(usuario.tipo === usuariosEnum.Participante) {
                const avaliacoes = await AvaliacaoModel.find({ "autor.idUsuario": idUsuario });
                return res.status(200).json({ dados: avaliacoes });
            } else {
                return res.json({ msg: "Este tipo de usuário não possui avaliações", erro: true });
            }
        } catch (err) {
            return res.json({ msg: "Não foi possível buscar as avaliações deste usuário, tente novamente", erro: true });
        }
    }

    public static async excluirAvaliacao(req: Request, res: Response) {
        try {
            const excluida = await AvaliacaoModel.excluirAvaliacao(req.params.idAvaliacao);
            if(excluida)
                res.json({ msg: "Avaliação excluída com sucesso" });
            else
                throw new Error();
        } catch (err) {
            return res.json({ msg: "Ocorreu um erro durante a exclusão desta avaliação, tente novamente", erro: true });
        }
    }
}