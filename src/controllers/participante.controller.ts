import { Request, Response } from "express";

import Email from "../email/Email";
import { HistoricoInscricaoModel } from "../model/historicoInscricao.model";
import { AvaliacaoModel, EventoModel, InscricaoModel, ParticipanteModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";
import { EventoQuery } from "../types/types";
import { buscarCategorias } from "../util/buscarCategorias";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import validarSenha from "../util/validarSenha";


class ParticipanteController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, nomeCompleto, documento, endereco, dataNascimento, genero, categoriasFavoritas } = req.body;
        
        const emailEmUso = await UsuarioModel.emailEmUso(email);
        if(emailEmUso)
            return res.status(400).json({ msg: "O e-mail fornecido já está em uso", erro: true });
        if(!validarSenha(senha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });

        try {
            const emailToken = gerarTokenGenerico();
            const novoParticipante = new ParticipanteModel({
                email, senha, nomeCompleto, genero,
                documento, dataNascimento,
                categoriasFavoritas: await buscarCategorias(categoriasFavoritas),
                endereco,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novoParticipante.save();
            Email.Instance.enviarEmailCadastro({ email, tipo: "Participante" }, novoParticipante.nomeCompleto.split(" ")[0], emailToken);

            res.status(200).json({ msg: "Cadastro realizado com sucesso, verifique a caixa de entrada do seu e-mail" });
        } catch(err: unknown) {
            const erro = err as Record<string, Record<string, unknown>>; 
            if(erro.keyValue.email)
                res.status(400).json({ msg: "Falha ao realizar cadastro, este e-mail já está em uso", erro: true });
            else
                res.status(400).json({ msg: "Falha ao realizar cadastro", erro: true });
        }
    }

    static async historicoInscricoes(req: Request, res: Response) {
        try {
            const historico = await HistoricoInscricaoModel.historicoParticipante(req.userId!);
            const avaliacoes = await AvaliacaoModel.buscarAvaliacoesUsuario(req.userId!);
            const idEventos = avaliacoes.map(a => a.evento.idEvento);
            const historicoFormatado = historico.map(h => ({
                    ...h.toObject(),
                    avaliado: idEventos.includes(h.evento.idEvento)
            }));
            
            res.status(200).json({ dados: historicoFormatado });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao buscar seu histórico, tente novamente", erro: true });
        }
    }

    static async obterDadosPerfil(req: Request, res: Response) {
        const participante = await ParticipanteModel.obterDadosPerfil(req.params.username);
        if(!participante)
            return res.json({ msg: "Participante não encontrado", erro: true });

        const camposTrabalhados = await participante.ocultarDadosPerfil(req.userId);

        const retorno = {
            ...participante.toObject(),
            quantiaEventos: await HistoricoInscricaoModel.contarParticipacoes(participante._id),
            ...camposTrabalhados,
            inscricoes: participante.inscricoes.map(i => (i as unknown as NonNullable<EventoQuery>).toObject()),
            acompanhando: participante.acompanhando.map(a => (a as unknown as NonNullable<EventoQuery>).toObject()),
        };

        res.status(201).json(retorno);
    }

    static async atualizarDados(req: Request, res: Response) {
        try {
            const novaFoto = req.file ? req.file.buffer : undefined;

            const participante = await ParticipanteModel.atualizarPerfil(req.userId as string, req.body, novaFoto);
            if(!participante)
                throw new Error();

            const fotoPerfil = participante.fotoPerfil ? participante.fotoPerfil?.toString("base64") : undefined;
            const dados = {
                ...participante.toObject(),
                fotoPerfil,
                categoriasFavoritas: participante.categoriasFavoritas.map(c => ({ slug: c._id, titulo: c.titulo }))
            };
            res.json({ msg: "Dados atualizados com sucesso", dados });
        } catch (err) {
            res.json({ msg: "Não foi possível atualizar os dados, tente novamente.", erro: true });
        }
    }

    static async inscricoesEvento(req: Request, res: Response) {
        try {
            const { idPublico } = req.params;
            const evento = await EventoModel.findOne({ _publicId: idPublico });
            if(!evento)
                throw new Error();
            const inscricoesPeriodos = await InscricaoModel.find({
                "participante.idUsuario": req.userId,
                "evento.idEvento": evento._id
            }).select("-_id periodo");
            res.status(200).json({ dados: inscricoesPeriodos.map(p => p.periodo) });
        } catch (err) {
            res.status(400).json({ msg: "Não foi possível buscar suas inscrições neste evento, tente novamente", erro: true });
        }
    }
    
    static async getAll(req: Request, res: Response) {
        const allUsers = await ParticipanteModel.find();
        res.json(allUsers);
    }
}

export default ParticipanteController;