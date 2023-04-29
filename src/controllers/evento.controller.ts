import { Request, Response } from "express";
import { DateTime } from "luxon";
import { Types } from "mongoose";
import sharp from "sharp";

import Email from "../email/Email";
import { Evento } from "../model/evento.model";
import { Inscricao } from "../model/inscricao.model";
import { EventoModel, InscricaoModel, ParticipanteModel, PeriodoModel } from "../model/models";
import { Periodo } from "../model/periodo.model";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { IIdentificacaoEvento, IPeriodo, IPeriodoAtualizacao, IPesquisaEvento, IResumoInscricao } from "../types/interface";
import { buscarCategorias } from "../util/buscarCategorias";
import { buscarIdOperadores } from "../util/buscarIdOperadores";

/* eslint-disable @typescript-eslint/no-explicit-any */
class EventoController {

    public static async novoEvento(req: Request, res: Response) {
        req.body.periodos = JSON.parse(req.body.periodos);
        const dados = req.body;
        const banner = req.file;
        if(!banner)
            return res.json({ msg: "É obrigatório adicionar um banner ao evento à ser criado" });
        
        if(DateTime.fromJSDate(dados.inscricoesInicio) > DateTime.fromJSDate(dados.inscricoesTermino))
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a final", erro: true });
        try {
            const novoEvento = new EventoModel({
                criador: IdentificacaoUsuario.gerarIdentificacao(req.instituicao),
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: await sharp(banner.buffer).jpeg({ quality: 50 }).toBuffer(),
                endereco: dados.endereco,
                inscricoesInicio: new Date(dados.inscricoesInicio),
                inscricoesTermino: new Date(dados.inscricoesTermino),
                categorias: await buscarCategorias(dados.categorias),
                operadores: await buscarIdOperadores(dados.operadores)
            });
            await novoEvento.save();
            await req.instituicao!.adicionarEvento(novoEvento._id);
            const periodos = await PeriodoModel.criarParaEvento(dados.periodos as Array<IPeriodo>, novoEvento._id);
            novoEvento.periodosOcorrencia = periodos.map(p => p._id);
            await novoEvento.save();

            res.json({ msg: "Evento criado com sucesso", redirect: `/evento/${novoEvento._publicId}/${novoEvento.slug}` });
        } catch (err) {
            res.json({ msg: "Não foi possível criar o evento", erro: true, detalhes: err });
        }
    }

    public static async editarEvento(req: Request, res: Response) {
        const dados = req.body;
        const { idEvento } = req.params;
        const banner = req.file;

        if(!req.instituicao!.eventos.includes(idEvento as any))
            return res.json({ msg: "Não autorizado: você não é proprietário(a) deste evento", erro: true });
        
        if(dados.inscricoesInicio > dados.inscricoesTermino)
            return res.json({ msg: "A data de inscrições inicial não pode ser menor que a data final", erro: true });
        
        try {
            const editado = await EventoModel.findByIdAndUpdate(idEvento, { $set: {
                criador: IdentificacaoUsuario.gerarIdentificacao(req.instituicao),
                titulo: dados.titulo,
                descricao: dados.descricao,
                banner: banner ? await sharp(banner.buffer).jpeg({ quality: 50 }).toBuffer() : undefined,
                endereco: dados.endereco,
                inscricoesInicio: new Date(dados.inscricoesInicio),
                inscricoesTermino: new Date(dados.inscricoesTermino),
                categorias: await buscarCategorias(dados.categorias),
                operadores: await buscarIdOperadores(dados.operadores)
            }
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
        
        // TODO: testar
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
        
        try {
            const sucesso = await evento.cancelarEvento();
            if(sucesso) {
                const inscricoes = await InscricaoModel.find({ "evento.idEvento": idEvento }).populate("periodo");
                for(const i of inscricoes) {
                    const participante = await ParticipanteModel.findById(i.participante.idUsuario);
                    if(participante)
                        Email.Instance.enviarAvisoCancelamentoEvento(participante.email, evento as Evento, i.periodo as Periodo);
                }
                res.json({ msg: `${evento.titulo} cancelado com sucesso` });
            } else {
                res.json({ msg: "Não foi possível cancelar este evento", erro: true });
            }
        } catch (err) {
            res.json({ msg: "Ocorreu um erro ao tentar cancelar este evento, tente novamente", erro: true });
        }
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

    public static async pesquisa(req: Request<unknown, unknown, unknown, IPesquisaEvento>, res: Response) {
        try {
            const resPesquisa = await EventoModel.pesquisar(req.query);
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
        // Lista quantidade de inscrições e detalhes de todos os períodos de um evento
        const idEvento = req.params.idEvento;
        const inscricoes = await PeriodoModel.aggregate<{ inscricoes: number } & IPeriodo>([
            {
                $match: { "evento": new Types.ObjectId(idEvento) }
            },
            {
                $lookup: {
                    from: InscricaoModel.collection.collectionName,
                    localField: "_id",
                    foreignField: "periodo",
                    as: "inscricoesPeriodo"
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

    static async inscricoesNoPeriodo(req: Request, res: Response) {
        // Listagem de participantes no evento que a instituição ou operador podem ver
        try {
            const inscricoesRaw = await InscricaoModel.listarPorPeriodoEvento(req.params.idPeriodo);
            if(!inscricoesRaw)
                throw new Error();
            const inscricoes: Array<IResumoInscricao> = inscricoesRaw.map((i: Inscricao) =>
                ({ confirmada: i.confirmada, nomeUsuario: i.participante.nome })
            );
            return res.json(inscricoes);
        } catch (err) {
            return res.json({ msg: "Não foi possível buscar as inscrições para esta ocorrência deste evento, tente novamente", erro: true });
        }
    }

    public static async cancelarPeriodo(req: Request, res: Response) {
        const periodo = await PeriodoModel.findById(req.params.idPeriodo);
        if(!periodo)
            return res.json({ msg: "Período inválido", erro: true });
        if(periodo.cancelado)
            return res.json({ msg: "Este período já foi cancelado", erro: true });
        try {
            if(await periodo.cancelar()) {
                const detalhes = (await InscricaoModel.buscarTodosInscritos(req.params.idPeriodo) as any)[0];
                const dadosEvento: IIdentificacaoEvento = detalhes.evento;
                const inscritos: { email: string; nomeCompleto: string }[]  = detalhes.inscritos;
                
                inscritos.map(i => Email.Instance.enviarAvisoCancelamentoPeriodo(i.email, dadosEvento, periodo));

                return res.json({ msg: "Período cancelado com sucesso", erro: true });
            } else
                return res.json({ msg: "Não foi possível cancelar este período, tente novamente", erro: true });
        } catch (err) {
            res.json({ msg: "Ocorreu um erro ao tentar cancelar este período, tente novamente", erro: true });
        }
    }

    public static async atualizarPeriodos(req: Request<{ idEvento: string }, unknown, IPeriodoAtualizacao>, res: Response) {
        const { idEvento } = req.params;
        const dados = req.body;
        const evento = await EventoModel.findById(idEvento);
        if(!evento)
            return res.status(404).json({ msg: "Evento não encontrado", erro: true });
        
        if(!evento.permiteAlteracoes()) {
            return res.status(400).json({
                msg: "Não é possível adicionar, editar ou excluir períodosmenos de 24 horas antes do evento começar",
                erro: true
            });
        }

        let idsPeriodos: string[] = evento.periodosOcorrencia.map(p => p._id.toString());

        if(dados.adicionar) {
            (await PeriodoModel.criarParaEvento(dados.adicionar, idEvento)).map(p => {
                idsPeriodos.push(p._id.toString());
            });
        }
        if(dados.atualizar) {
            await PeriodoModel.atualizarPeriodos(dados.atualizar);
        }
        if(dados.deletar) {
            for(const p of dados.deletar) {
                const deletado = await PeriodoModel.findByIdAndDelete(p.id);
                if(deletado)
                    idsPeriodos = idsPeriodos.filter(id => id !== p.id);
            }
        }
        evento.periodosOcorrencia = idsPeriodos as any; // typescript dá erro dizendo que Ref<Periodo>[] não pode ser string[]
        evento.save();

        res.send({ dados: idsPeriodos });
    }
}

export default EventoController;