import { Request, Response } from "express";
import { DateTime } from "luxon";

import Email from "../email/Email";
import { EventoModel, InscricaoModel, ParticipanteModel, PeriodoModel } from "../model/models";
import { Periodo } from "../model/periodo.model";
import { IdentificacaoEvento } from "../schema/identificacaoEvento.schema";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
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
                return res.status(404).json({ msg: "ID de Período inválido", erro: true });

            if(!evento.periodosOcorrencia.includes(periodo._id))
                return res.status(401).json({ msg: "Este evento não ocorre no período selecionado", erro: true });
            
            if(await InscricaoModel.usuarioJaInscrito(req.userId as string, periodo._id))
                return res.status(403).json({ msg: "Não é possível se inscrever em um determinado período de um evento mais de uma vez", erro: true });

            if(new Date() < evento.inscricoesInicio) {
                const data = DateTime.fromJSDate(evento.inscricoesInicio).toFormat("dd/MM/yyyy 'às' HH:mm:ss");
                return res.status(401).json({ msg: "Não é possível se inscrever neste evento: as inscrições começam " + data, erro: true });
            } else if(new Date > evento.inscricoesTermino) {
                const data = DateTime.fromJSDate(evento.inscricoesTermino).toFormat("dd/MM/yyyy 'às' HH:mm:ss");
                return res.status(401).json({ msg: "Não é possível se inscrever neste evento: as inscrições acabaram " + data, erro: true });
            }

            if(await periodo.limiteInscricoesAtingido())
                return res.status(403).json({ msg: "Não foi possível realizar sua inscrição neste evento, pois não há mais inscrições disponíveis.", erro: true });
            
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
            const dadosInscricao = await InscricaoModel.buscarInscricao(inscricao._id);
            res.status(200).json({ msg: "Inscrição realizada com sucesso", dados: dadosInscricao });
        } catch (err) {
            res.status(401).json({ msg: "Não foi possível realizar sua inscrição neste evento, tente novamente.", erro: true, detalhes: err });
        }
    }

    static async cancelarInscricao(req: Request, res: Response) {
        // Deletar inscrição por parte do participante
        const idInscricao = req.params.idInscricao;
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
        const idEvento: string = req.body.idEvento;
        const operadorAtribuido = await EventoModel.findOne({ "_id": idEvento, "operadores": req.userId });

        if(!operadorAtribuido)
            return res.status(403).json({ msg: "Não autorizado: você não foi atribuído à este evento", erro: true });
        
        const inscricao = await InscricaoModel.dadosInscricao(req.params.idInscricao);
        if(!inscricao)
            return res.status(400).json({ msg: "Inscricão inválida, contate seu gestor", erro: true });
        else if(inscricao.evento.idEvento !== idEvento)
            return res.status(403).json({ msg: "Inscricão inválida: esta inscrição não foi feita neste evento", erro: true });
        else if(inscricao.confirmada)
            return res.status(400).json({ msg: "Esta inscrição já está confirmada", erro: true });
        
        if(!eventoDentroPeriodo(inscricao.periodo as Periodo))
            return res.status(403).json({ msg: "Não é possível confirmar uma inscrição fora do período do evento em que está inscrito(a)", erro: true });
        
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
            res.status(400).json({ msg: "Não foi possível confirmar esta inscrição de evento, tente novamente.", erro: true, detalhes: err });
        }
    }

    static async detalhesInscricao(req: Request, res: Response) {
        try {
            const inscricao = await InscricaoModel.buscarInscricao(req.params.idInscricao);
            if(!inscricao)
                res.json({ msg: "Inscrição não encontrada", erro: true });
            else
                res.json({ dados: inscricao });
        } catch (err) {
            return res.json({ msg: "Não foi possível buscar os detalhes desta inscrição, tente novamente", erro: true });
        }
    }
}