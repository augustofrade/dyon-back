import { Request, Response } from "express";

import Email from "../email/Email";
import { HistoricoInscricaoModel } from "../model/historicoInscricao.model";
import { InscricaoModel, ParticipanteModel } from "../model/models";
import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";
import { buscarCategorias } from "../util/buscarCategorias";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import validarSenha from "../util/validarSenha";


class ParticipanteController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, nomeCompleto, documento, telefone, endereco, dataNascimento, genero, categoriasFavoritas } = req.body;
        if(!validarSenha(senha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        try {
            const emailToken = gerarTokenGenerico();
            const novoParticipante = new ParticipanteModel({
                email, senha, nomeCompleto, telefone, genero,
                documento, dataNascimento,
                categoriasFavoritas: await buscarCategorias(categoriasFavoritas),
                endereco,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novoParticipante.save();
            Email.Instance.enviarEmailCadastro({ email, tipo: "Participante" }, novoParticipante.nomeCompleto.split(" ")[0], emailToken);

            const { token: refreshToken, dataExpiracao } = gerarRefreshToken({ id: novoParticipante._id, email: novoParticipante.email });
            const accessToken = gerarAccesToken({ id: novoParticipante._id, email: novoParticipante.email });
            novoParticipante.adicionarRefreshToken(refreshToken);
            
            res.cookie("token", refreshToken, { expires: dataExpiracao });
            res.status(200).json({ msg: "Cadastro realizado com sucesso", token: accessToken });
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
            res.status(200).json({ dados: historico });
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
            ...camposTrabalhados
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
            const { idEvento } = req.params;
            const inscricoesPeriodos = await InscricaoModel.find({
                "participante.idUsuario": req.userId,
                "evento.idEvento": idEvento
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