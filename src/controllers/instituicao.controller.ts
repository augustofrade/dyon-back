import { Request, Response } from "express";

import Email from "../email/Email";
import { Evento } from "../model/evento.model";
import { ICategoria } from "../types/interface";
import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";
import validarSenha from "../util/validarSenha";
import { InstituicaoModel, ParticipanteModel } from "./../model/models";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";

export default class InstituicaoController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, telefone, nomeFantasia,
            nomeRepresentante, cnpj, categoriasRamo, endereco } = req.body;
        if(!validarSenha(senha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        try {
            const emailToken = gerarTokenGenerico();
            const novaInstituicao = new InstituicaoModel({
                email, senha, nomeFantasia, telefone,
                nomeRepresentante, cnpj, categoriasRamo,
                endereco: endereco,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novaInstituicao.save();
            Email.Instance.enviarEmailCadastro({ email, tipo: "Instituição" }, novaInstituicao.nomeFantasia, emailToken);
            
            const { token: refreshToken, dataExpiracao } = gerarRefreshToken({ id: novaInstituicao._id, email: novaInstituicao.email });
            const accessToken = gerarAccesToken({ id: novaInstituicao._id, email: novaInstituicao.email });
            novaInstituicao.adicionarRefreshToken(refreshToken);

            res.cookie("token", refreshToken, { expires: dataExpiracao });
            res.status(200).json({ msg: "Cadastro realizado com sucesso", token: accessToken });
        } catch(err) {
            const erro = err as Record<string, Record<string, unknown>>; 
            if(erro.keyValue.email)
                res.status(400).json({ msg: "Falha ao realizar cadastro, este e-mail já está em uso", erro: true });
            else
                res.status(400).json({ msg: "Falha ao realizar cadastro", erro: true });
        }
    }
    
    static async obterDadosPerfil(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.obterDadosPerfil(req.params.username);
        if(!instituicao)
            return res.json({ msg: "Instituição não encontrada", erro: true });
        
        const categoriasRamo: ICategoria[] = instituicao.categoriasRamo.map(c => <ICategoria>{ slug: c._id, titulo: c.titulo });
        const eventos = instituicao._id === req.userId ? instituicao.eventos : instituicao.eventos.map((e => (<Evento>e).visivel));
        const avaliacaoMedia = instituicao.avaliacaoMedia();

        const retorno = {
            ...instituicao.toObject(),
            quantiaEventos: instituicao.eventos.length,
            categoriasRamo,
            eventos,
            avaliacaoMedia,
            endereco: instituicao.configuracoes.exibirEndereco ? instituicao.endereco: undefined
        };
        
        res.status(201).json(retorno);
    }

    static async atualizarDados(req: Request, res: Response) {
        try {
            const novaFoto = req.file ? req.file.buffer : undefined;
            const instituicao = await InstituicaoModel.atualizarPerfil(req.userId as string, req.body, novaFoto);

            // TODO: verificar melhor maneira de enviar a foto do perfil para o front em todas as rotas
            const fotoPerfil = instituicao!.fotoPerfil ? instituicao!.fotoPerfil?.toString("base64") : undefined;
            const dados = { ...instituicao!.toObject(), fotoPerfil,
                categoriasRamo: instituicao!.categoriasRamo.map(c => ({ slug: c._id, titulo: c.titulo }))
            };
            res.json({ msg: "Dados atualizados com sucesso", dados });
        } catch (err) {
            res.json({ msg: "Não foi possível atualizar os dados, tente novamente.", erro: true });
        }
    }

    static async seguirInstituicao(req: Request, res: Response) {
        
        const instituicao = await InstituicaoModel.findOne({ username: req.params.username });
        if(!instituicao)
            return res.status(404).json({ msg: "Instituição não encontrada", erro: true });

        try {
            if(req.participante!.seguindo.includes(instituicao._id)) {
                await ParticipanteModel.findByIdAndUpdate(req.userId, { $pull: { seguindo: instituicao._id } });
                res.status(200).json({ msg: `Deixou de seguir ${instituicao.nomeFantasia}` });
            } else {
                await ParticipanteModel.findByIdAndUpdate(req.userId, { $push: { seguindo: instituicao._id } });
                res.status(200).json({ msg: `Começou a seguir ${instituicao.nomeFantasia}` });
            }

        } catch(err) {
            res.status(400).json({ msg: `Ocorreu um erro ao tentar seguir ${instituicao.nomeFantasia}`, erro: true });
        }
    }

    static async obterEndereco(req: Request, res: Response) {
        try {
            res.json(req.instituicao!.endereco);
        } catch (err) {
            res.json({ msg: "Não foi possível buscar os dados do endereço", erro: true });
        }
    }
    
}