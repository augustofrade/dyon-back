import { gerarTokenGenerico } from "./../util/gerarTokenGenerico";
import { InstituicaoModel, ParticipanteModel } from "./../model/models";
import { Request, Response } from "express";
import Email from "../email/Email";

export default class InstituicaoController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, telefone, nomeFantasia,
            nomeRepresentante, cnpj, categoriasRamo, endereco } = req.body;

        try {
            const emailToken = gerarTokenGenerico();
            const instituicaoCriada = new InstituicaoModel({
                email, senha, nomeFantasia, telefone,
                nomeRepresentante, cnpj, categoriasRamo, endereco,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await instituicaoCriada.save();
            Email.Instance.enviarEmailDeCadastro(email, instituicaoCriada.nomeFantasia, emailToken);
            res.status(200).json({ msg: "Cadastro realizado com sucesso" });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async excluirConta(req: Request, res: Response) {
        // TODO: excluir conta e redirecionar para /auth/logout
    }

    static async obterDadosPerfil(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.obterDadosPerfil(req.params.username);
        if(!instituicao)
            return res.json({ msg: "Instituição não encontrada", erro: true });
        
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

    static async atualizarPrivacidade(req: Request, res: Response) {
        const instituicao = await InstituicaoModel.findById(res.locals.userId);
        if(!instituicao)
            return res.status(404).json({ msg: "Erro interno", erro: true });
        
        try {

            instituicao.configuracoes.exibirEndereco = req.body.exibirEndereco ?? true;
            instituicao.save();
            res.status(200).json({ msg: "Configurações de privacidade salvas com sucesso" });
        } catch(err) {
            res.status(400).json({ msg: "Não foi possível salvar as configurações de privacidade. Tente novamente.", erro: true });
        }
        
    }

    static async seguirInstituicao(req: Request, res: Response) {
        const usuario = await ParticipanteModel.findById(res.locals.userId);
        if(!usuario)
            return res.status(404).json({ msg: "Erro interno", erro: true });
        
        const instituicao = await InstituicaoModel.findOne({ username: req.params.username });
        if(!instituicao)
            return res.status(404).json({ msg: "Perfil de instituição não encontrado", erro: true });
        
        try {
            if(usuario.seguindo.includes(instituicao._id)) {
                await ParticipanteModel.findByIdAndUpdate(res.locals.userId, { $pull: { seguindo: { _id: instituicao._id } } });
                res.status(200).json({ msg: `Deixou de seguir ${instituicao.nomeFantasia}` });
            } else {
                await ParticipanteModel.findByIdAndUpdate(res.locals.userId, { $push: { seguindo: { _id: instituicao._id } } });
                res.status(200).json({ msg: `Começou a seguir ${instituicao.nomeFantasia}` });
            }

        } catch(err) {
            res.status(400).json({ msg: `Ocorreu um erro ao tentar seguir ${instituicao.nomeFantasia}`, erro: true });
        }
    }

    static async obterEndereco(req: Request, res: Response) {
        try {
            const instituicao = await InstituicaoModel.obterEndereco(res.locals.userId);
            if(!instituicao)
                throw new Error();
            
            res.json(instituicao.endereco);
        } catch (err) {
            res.json({ msg: "Não foi possível buscar os dados do endereço", erro: true });
        }
    }
    
}