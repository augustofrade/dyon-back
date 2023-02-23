import { EventoModel, InstituicaoModel } from "../model/models";
import { Request, Response } from "express";
import { ICategoriaVM } from "../types/interface";

class EventoController {

    public static async novoEvento(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        if(!instituicao)
            return res.json({ msg: "Não autorizado", erro: true });
        
        try {

            const dados = req.body;
            
            const novoEvento = new EventoModel({
                criador: res.locals.userId,
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: dados.banner,
                endereco: dados.endereco,
                inscricoesMaximo: dados.inscricoesMaximo,
                inscricoesInicio: dados.inscricoesInicio,
                inscricoesTermino: dados.inscricoesTermino,
                periodosOcorrencia: dados.periodos,
                categorias: (dados.categorias as Array<ICategoriaVM>).map(c => ({ _id: c.slug, titulo: c.titulo }))
            });
            novoEvento.save();
            res.json({ msg: "Evento criado com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível criar o evento", erro: true, detalhes: err });
        }
    }

    public static async getAll(req: Request, res: Response): Promise<void> {
        // TODO: desenvolver sistema de recomendação
        const todosEventos = EventoModel.find();
        res.json(todosEventos);
    }

    public static async dados(req: Request, res: Response): Promise<void> {
        const evento = await EventoModel.dadosResumidos(req.params.id);
        res.send(evento);
    }
}

export default EventoController;