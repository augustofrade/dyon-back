/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { DateTime } from "luxon";
import { Types } from "mongoose";

import { PeriodoModel } from "../model/models";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { IPeriodo } from "../types/interface";
import { buscarIdOperadores } from "../util/buscarIdOperadores";
import { EventoModel, InscricaoModel, ParticipanteModel } from "../model/models";
import { buscarCategorias } from "../util/buscarCategorias";

class EventoController {

    public static async novoEvento(req: Request, res: Response) {
        
        const dados = req.body;
        
        if(DateTime.fromJSDate(dados.inscricoesInicio) > DateTime.fromJSDate(dados.inscricoesTermino))
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a final", erro: true });
        
        try {
            const novoEvento = new EventoModel({
                criador: IdentificacaoUsuario.gerarIdentificacao(req.instituicao),
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: dados.banner,
                endereco: dados.endereco,
                inscricoesInicio: dados.inscricoesInicio,
                inscricoesTermino: dados.inscricoesTermino,
                categorias: await buscarCategorias(dados.categorias),
                operadores: await buscarIdOperadores(dados.operadores)
            });
            await novoEvento.save();
            await req.instituicao!.adicionarEvento(novoEvento._id);
            const periodos = await PeriodoModel.criarParaEvento(dados.periodos as Array<IPeriodo>, novoEvento._id);
            novoEvento.periodosOcorrencia = periodos.sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()).map(p => p._id);
            await novoEvento.save();

            res.json({ msg: "Evento criado com sucesso", redirect: `/evento/${novoEvento._publicId}/${novoEvento.slug}` });
        } catch (err) {
            res.json({ msg: "Não foi possível criar o evento", erro: true, detalhes: err });
        }
    }

    public static async editarEvento(req: Request, res: Response) {
        const dados = req.body;
        const { idEvento } = req.params;

        if(!req.instituicao!.eventos.includes(idEvento as any))
            return res.json({ msg: "Não autorizado: você não é proprietário(a) deste evento", erro: true });
        
        if(dados.inscricoesInicio > dados.inscricoesTermino)
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a data final", erro: true });
        
        // TODO: Adicionar exceção para cancelamento de ocorrência em um período
        try {
            const periodos = await PeriodoModel.atualizar(dados.periodos, idEvento);

            const editado = await EventoModel.findByIdAndUpdate(idEvento, {
                criador: IdentificacaoUsuario.gerarIdentificacao(req.instituicao),
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: dados.banner,
                endereco: dados.endereco,
                inscricoesInicio: dados.inscricoesInicio,
                inscricoesTermino: dados.inscricoesTermino,
                periodosOcorrencia: periodos,
                categorias: await buscarCategorias(dados.categorias),
                operadores: await buscarIdOperadores(dados.operadores)
            }, { new: true });
            
            if(!editado) throw new Error();

            res.json({ msg: "Os dados do evento foram alterados com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível alterar os dados do evento", erro: true, detalhes: err });
        }
    }

    public static async excluirEvento(req: Request, res: Response) {
        // TODO: reavaliar usos deste método, como quando não houver nenhuma inscrição
        const { idEvento } = req.params;
        const evento = await EventoModel.findById(idEvento);

        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });

        if(!req.instituicao!.eventos.includes(idEvento as any))
            return res.json({ msg: "Não autorizado: você não é proprietário(a) deste evento", erro: true });
        
        if(evento.permiteAlteracoes()) {
            try {
                const sucesso = await evento.delete() && await req.instituicao!.removerEvento(idEvento);
                if(!sucesso)
                    throw new Error();

                res.json({ msg: "Evento excluído com sucesso" });
            } catch (err) {
                res.json({ msg: "Não foi possível excluir o evento", erro: true, detalhes: err });
            }
        }
        
    }

    public static async cancelarEvento(req: Request, res: Response) {
        const { idEvento } = req.params;
        const evento = await EventoModel.findById(idEvento);
        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });

        if(!req.instituicao!.eventos.includes(idEvento as any))
            return res.json({ msg: "Não autorizado: você não é proprietário(a) deste evento", erro: true });

        
        const sucesso = await evento.cancelarEvento();
        if(sucesso)
            res.json({ msg: `${evento.titulo} cancelado com sucesso` });
        else
            res.json({ msg: "Não foi possível cancelar este evento", erro: true });
    }

    public static async dadosEvento(req: Request, res: Response) {
        const evento = await EventoModel.dadosPublicos(req.params.idPublico);
        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });
        
        const camposDeletar = { criador: undefined };
        const resposta = {
            ...evento.toObject(),
            ...camposDeletar,
            inscricoes: evento.inscricoes.length,
            instituicao: evento.criador
        };

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

    public static async acompanharEvento(req: Request, res: Response) {
        const evento = await EventoModel.findById(req.params.idEvento);
        if(!evento)
            return res.json({ msg: "Evento não encontrado", erro: true });

        try {
            if(req.participante!.acompanhando.includes(evento._id)) {
                await ParticipanteModel.findByIdAndUpdate(req.userId, { $pull: { acompanhando: evento._id } });
                res.status(200).json({ msg: `Deixou de acompanhar o evento "${evento.titulo}"` });
            } else {
                await ParticipanteModel.findByIdAndUpdate(req.userId, { $push: { acompanhando: evento._id } });
                res.status(200).json({ msg: `Começou a acompanhar o evento "${evento.titulo}"` });
            }

        } catch(err) {
            res.status(400).json({ msg: `Ocorreu um erro ao tentar acompanhar o evento "${evento.titulo}"`, erro: true });
        }
    }

    public static async listarPeriodos(req: Request, res: Response) {
        const idEvento = req.params.idEvento;
        const inscricoes = await PeriodoModel.aggregate<IPeriodo>([
            {
                $match: { "evento": new Types.ObjectId(idEvento) }
            },
            {
                $lookup: {
                    from: InscricaoModel.collection.collectionName,
                    localField: "_id",
                    foreignField: "periodo",
                    as: "inscricoesPeriodo",
                    pipeline: [{
                        $match: { "cancelada": false }
                    }]
                }
            },
            {
                $addFields: { "inscricoes": { $size: "$inscricoesPeriodo" } }
            },
            {
                $unset: ["inscricoesPeriodo", "__v", "evento"]
            }
        ]);
        res.json(inscricoes);
    }
}

export default EventoController;