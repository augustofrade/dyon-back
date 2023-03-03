import { buscarCategorias } from "./../util/buscarCategorias";
import { EventoModel, InstituicaoModel } from "../model/models";
import { Request, Response } from "express";
import { Avaliacao } from "../schema/avaliacao.schema";
import { Instituicao } from "../model/instituicao.model";
import { DateTime } from "luxon";
import { Periodo } from "../schema/periodo.schema";

class EventoController {

    public static async novoEvento(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        if(!instituicao)
            return res.json({ msg: "Não autorizado", erro: true });
        
        const dados = req.body;
        
        if(DateTime.fromJSDate(dados.inscricoesInicio) > DateTime.fromJSDate(dados.inscricoesTermino))
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a final", erro: true });
        
        try {
            const novoEvento = new EventoModel({
                criador: res.locals.userId,
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: dados.banner,
                endereco: dados.endereco,
                inscricoesInicio: dados.inscricoesInicio,
                inscricoesTermino: dados.inscricoesTermino,
                periodosOcorrencia: (<Array<Periodo>>dados.periodos).sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
                categorias: await buscarCategorias(dados.categorias)
            });
            await novoEvento.save();
            instituicao.eventos.push(novoEvento._id);
            await instituicao.save();
            res.json({ msg: "Evento criado com sucesso", redirect: `/evento/${novoEvento._publicId}/${novoEvento.slug}` });
        } catch (err) {
            console.log(err);
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
            const editado = await EventoModel.findByIdAndUpdate(dados.idEvento, {
                criador: res.locals.userId,
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: dados.banner,
                endereco: dados.endereco,
                inscricoesInicio: dados.inscricoesInicio,
                inscricoesTermino: dados.inscricoesTermino,
                periodosOcorrencia: dados.periodos,
                categorias: await buscarCategorias(dados.categorias)
            }, { new: true });
            
            if(!editado) throw new Error();

            res.json({ msg: "Os dados do evento foram alterados com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível alterar os dados do evento", erro: true, detalhes: err });
        }
    }

    public static async excluirEvento(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        const evento = await EventoModel.findById(req.body.idEvento);

        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });

        if(!instituicao || !instituicao.eventos.includes(req.body.idEvento))
            return res.json({ msg: "Não autorizado", erro: true });
        
        if(evento.permiteAlteracoes()) {
            try {
                const sucesso = await evento.delete() && await instituicao.removerEvento(req.body.idEvento);
                if(!sucesso)
                    throw new Error();

                res.json({ msg: "Evento excluído com sucesso" });
            } catch (err) {
                res.json({ msg: "Não foi possível excluir o evento", erro: true, detalhes: err });
            }
        }
        
    }

    public static async dadosEvento(req: Request, res: Response) {
        const evento = await EventoModel.todosDadosPorId(req.params.id);
        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });
        
        const avaliacaoMedia = evento.avaliacoes.reduce((soma: number, avaliacao: Avaliacao) => { return soma + avaliacao.nota; }, 0);
        
        const camposDeletar = { avaliacoes: undefined, criador: undefined };
        const resposta = { ...evento.toObject(), ...camposDeletar, avaliacaoMedia, inscricoes: evento.inscricoes.length, instituicao: {
            nomeFantasia: (<Instituicao>evento.criador).nomeFantasia,
            username: (<Instituicao>evento.criador).username
        } };
        delete resposta.avaliacoes;
        delete resposta.criador;

        res.json(resposta);
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