import { Request, Response } from "express";

import Email from "../email/Email";
import { Inscricao } from "../model/inscricao.model";
import { EventoModel, InscricaoModel, ParticipanteModel, PeriodoModel } from "../model/models";
import { Periodo } from "../model/periodo.model";
import { IdentificacaoEvento } from "../schema/identificacaoEvento.schema";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { IResumoInscricao } from "../types/interface";
import { eventoDentroPeriodo } from "../util/eventoDentroPeriodo";

export default abstract class InscricaoController {

    static async novaInscricao(req: Request, res: Response) {
        // Inscrição em um período de um evento por parte de um participante
        const evento = await EventoModel.findById(req.body.idEvento);
        if(!evento)
            return res.json({ msg: "ID de Evento inválido", erro: true });
        try {
            const periodo = await PeriodoModel.findById(req.body.idPeriodo);
            if(!periodo)
                return res.json({ msg: "ID de Período inválido", erro: true });
            
            if(await InscricaoModel.usuarioJaInscrito(req.userId as string, periodo._id))
                return res.json({ msg: "Não é possível se inscrever em um determinado período de um evento mais de uma vez", erro: true });

            if(await periodo.limiteInscricoesAtingido())
                return res.json({ msg: "Não foi possível realizar sua inscrição neste evento, pois não há mais inscrições disponíveis.", erro: true });
            
            const inscricao = new InscricaoModel({
                participante: IdentificacaoUsuario.gerarIdentificacao(req.participante),
                periodo: periodo._id,
                evento: IdentificacaoEvento.gerarIdentificacao(evento, true, true, true)
            });
            await inscricao.save();
            req.participante!.inscricoes.push(inscricao._id);
            await req.participante!.save();
            evento.inscricoes.push(inscricao._id);
            await evento.save();
            res.status(200).json({ msg: "Inscrição realizada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível realizar sua inscrição neste evento, tente novamente.", erro: true, detalhes: err });
        }
    }

    static async cancelarInscricao(req: Request, res: Response) {
        // Cancelamento de inscrição por parte do participante
        const idInscricao = req.body.idInscricao;
        const inscricao = await InscricaoModel.findById(idInscricao);
        if(!inscricao || inscricao.participante.idUsuario !== req.userId)
            return res.json({ msg: "Você não está inscrito neste evento", erro: true });
        else if(inscricao.confirmada)
            return res.json({ msg: "Não é possível cancelar uma inscrição após ela já estar confirmada", erro: true });

        try {
            await ParticipanteModel.findByIdAndUpdate(req.userId, { $pull: { inscricoes: idInscricao } });
            await EventoModel.findByIdAndUpdate(inscricao.evento.idEvento, { $pull: { inscricoes: idInscricao } });
            await InscricaoModel.findByIdAndDelete(inscricao._id);
            res.status(200).json({ msg: "Inscrição cancelada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível cancelar sua inscrição neste evento", erro: true, detalhes: err });
        }
    }

    static async confirmarInscricao(req: Request, res: Response) {
        // Confirmação de inscrição por parte do operador
        const operadorAtribuido = await EventoModel.findOne({ "operadores": req.userId });

        if(!operadorAtribuido)
            return res.json({ msg: "Não autorizado: você não foi atribuído à este evento", erro: true });
        
        const inscricao = await InscricaoModel.dadosInscricao(req.params.idInscricao);
        if(!inscricao)
            return res.json({ msg: "Inscricão inválida, contate seu gestor", erro: true });
        else if(inscricao.confirmada)
            return res.json({ msg: "Esta inscrição já está confirmada", erro: true });
        
        if(!eventoDentroPeriodo(inscricao.periodo as Periodo))
            return res.json({ msg: "Não é possível confirmar uma inscrição fora do período do evento em que está inscrito(a)", erro: true });
        
        try {
            const participante = await ParticipanteModel.findById(inscricao.participante.idUsuario);

            await inscricao.confirmarParticipacao({
                nomeOperador: req.operador!.nomeCompleto,
                participante,
                instituicao: req.operador!.instituicao
            });

            const nomeInstituicao = req.operador!.instituicao.nome;
            Email.Instance.enviarEmailInscricaoConfirmada(participante!.email, participante!.nomeUsuario(), inscricao.evento.titulo, nomeInstituicao);
            res.status(201).json({ msg: "Inscrição confirmada com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível confirmar esta inscrição de evento, tente novamente. ", erro: true, detalhes: err });
        }
    }

    static async listarPorPeriodoEvento(req: Request, res: Response) {
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
}