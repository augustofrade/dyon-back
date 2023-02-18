import { InstituicaoModel } from "./../model/models";
import {  Request, Response } from "express";
import validarSenha from "../util/validarSenha";

export default class InstituicaoController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, telefone, nomeFantasia,
            nomeRepresentante, cnpj, categoriasRamo, endereco } = req.body;

        try {
            const instituicaoCriada = new InstituicaoModel({ email, senha, nomeFantasia, telefone, nomeRepresentante, cnpj, categoriasRamo, endereco });
            instituicaoCriada.save();
            res.status(200).json({ msg: "Cadastro realizado com sucesso" });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async obterDadosPerfil(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.obterDadosPerfil(req.params.username);
        if(!instituicao)
            return res.json({ msg: "Instituicao não encontrada", erro: true });
        
        res.status(201).json({ ...instituicao, quantiaEventos: instituicao.eventos.length });
    }

    static async atualizarDados(req: Request, res: Response) {
        const { nomeRepresentante, telefone, nomeFantasia, endereco } = req.body;
        
        const atualizado = await InstituicaoModel.findByIdAndUpdate(res.locals.userId, { nomeRepresentante, telefone, nomeFantasia, endereco }, { new: true });
        if(atualizado)
            res.status(200).json({ msg: "Seus dados foram atualizados com sucesso." });
        else
            res.status(400).json({ msg: "Não foi possível atualizar seus dados", erro: true });
    }

    static async atualizarSenha(req: Request, res: Response) {
        const { senhaAtual, novaSenha } = req.body;
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        if(!instituicao)
            return res.status(404).json({ msg: "Erro interno", erro: true });

        if(await instituicao.verificarSenha(senhaAtual))
           return res.status(400).json({ msg: "A senha informada está incorreta", erro: true });

        // TODO: validar senha com validarSenha(senhaConfirmar)
        
        instituicao.senha = novaSenha;
        instituicao.save();
        res.status(200).json({ msg: "Senha atualizada com sucesso" });
    }

    static async atualizarPrivacidade(req: Request, res: Response) {
        // TODO: criar props de configuracoes próprias da instituicao
    }

    static async obterEndereco(req: Request, res: Response) {
        const endereco = await InstituicaoModel.obterEndereco(res.locals.userId).endereco;
        res.json(endereco);
    }
    
}