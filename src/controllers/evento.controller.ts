import { EventoModel, InstituicaoModel } from "../model/models";
import { Request, Response } from "express";
import { ICategoriaVM } from "../types/interface";
import { Avaliacao } from "../schema/avaliacao.schema";
import { Instituicao } from "../model/instituicao.model";

class EventoController {

    public static async novoEvento(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        if(!instituicao)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const dados = req.body;
        
        if(dados.inscricoesInicio > dados.inscricoesTermino)
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a final", erro: true });
        
        try {
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

    public static async editarEvento(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        const dados = req.body;

        if(!instituicao || !instituicao.eventos.includes(dados.idEvento))
            return res.json({ msg: "Não autorizado", erro: true });
        
        if(dados.inscricoesInicio > dados.inscricoesTermino)
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a data final", erro: true });
        
        try {
            const editado = EventoModel.findByIdAndUpdate(dados.idEvento, {
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
            }, { new: true });
            
            if(!editado) throw new Error();

            res.json({ msg: "Os dados do evento foram alterados com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível alterar os dados do evento", erro: true, detalhes: err });
        }
    }

    public static async dadosEvento(req: Request, res: Response) {
        const evento = await EventoModel.todosDadosPorId(req.params.id);
        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });

        const avaliacao = evento.avaliacoes.reduce((soma: number, avaliacao: Avaliacao) => { return soma + avaliacao.nota; }, 0);
        const resposta = { ...evento, avaliacoes: undefined, criador: undefined, avaliacao, instituicao: {
            nomeFantasia: (<Instituicao>evento.criador).nomeFantasia,
            username: (<Instituicao>evento.criador).username
        } };
        delete resposta.avaliacoes;
        delete resposta.criador;
        
        res.send(resposta);
    }

    public static async pesquisa(req: Request, res: Response) {
        const { pesquisa, categoria, estado } = req.body;
        try {
            const resPesquisa = await EventoModel.pesquisar(pesquisa, categoria, estado);
            res.json(resPesquisa);
        } catch(err) {
            res.json({ msg: "Ocorreu um erro ao tentar pesquisar os eventos, tente novamente", erro: true, detalhes: err });
        }
    }

    public static async getAll(req: Request, res: Response) {
        // TODO: desenvolver sistema de recomendação
        const todosEventos = await EventoModel.find();
        res.json(todosEventos);
    }
}

export default EventoController;