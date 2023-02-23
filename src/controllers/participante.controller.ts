import { Request, Response } from "express";
import Email from "../email/Email";
import { Inscricao } from "../model/inscricao.model";
import { ParticipanteModel } from "../model/models";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";


class ParticipanteController {

    static async cadastro(req: Request, res: Response) {            
        const { email, senha, nomeCompleto, cpf, telefone, endereco, dataNascimento, categoriasFavoritas } = req.body;
        try {
            const emailToken = gerarTokenGenerico();
            const novoParticipante = new ParticipanteModel({
                email, senha, nomeCompleto, telefone,
                cpf, categoriasFavoritas, endereco, dataNascimento,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novoParticipante.save();
            Email.Instance.enviarEmailDeCadastro(email, novoParticipante.nomeCompleto.split(" ")[0], emailToken);
            res.status(200).json({ msg: "Cadastro realizado com sucesso" });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async excluirConta(req: Request, res: Response) {
        // TODO: excluir conta e redirecionar para /auth/logout
    }

    static async obterDadosPerfil(req: Request, res: Response) {
        const participante = await ParticipanteModel.obterDadosPerfil(req.params.username);
        if(!participante)
            return res.json({ msg: "Participante não encontrado", erro: true });
        
        res.status(201).json({ ...participante, quantiaEventos: participante.inscricoes.filter(i => (<Inscricao>i).confirmada).length });
    }

    static async atualizarPerfil(req: Request, res: Response) {
        const { nomeCompleto, nomeSocial, categoriasFavoritas, fotoPerfil } = req.body;
        
        const atualizado = await ParticipanteModel.findByIdAndUpdate(res.locals.userId, { nomeCompleto, nomeSocial, fotoPerfil, categoriasFavoritas }, { new: true });
        if(atualizado)
            res.status(200).json({ msg: "Os dados do seu perfil foram atualizado com sucesso." });
        else
            res.status(400).json({ msg: "Não foi possível atualizar seus dados de perfil", erro: true });
    }

    static async atualizarDados(req: Request, res: Response) {
        const { cpf, dataNascimento, genero, endereco } = req.body;
        
        const atualizado = await ParticipanteModel.findByIdAndUpdate(res.locals.userId, { cpf, dataNascimento, genero, endereco }, { new: true });
        if(atualizado)
            res.status(200).json({ msg: "Seus dados foram atualizados com sucesso." });
        else
            res.status(400).json({ msg: "Não foi possível atualizar seus dados", erro: true });
    }

    static async atualizarPrivacidade(req: Request, res: Response) {
        const participante = await ParticipanteModel.findById(res.locals.userId);
        if(!participante)
            return res.status(404).json({ msg: "Erro interno", erro: true });
        
        try {
            participante.configuracoes = {
                exibirInscricoes: req.body.exibirInscricoes ?? true,
                exibirCategorias: req.body.exibirCategorias ?? true,
                exibirSeguindo: req.body.exibirSeguindo ?? true,
                exibirHistorico: req.body.exibirHistorico ?? true
            };
            participante.save();
            res.status(200).json({ msg: "Configurações de privacidade salvas com sucesso" });
        } catch(err) {
            res.status(400).json({ msg: "Não foi possível salvar as configurações de privacidade. Tente novamente.", erro: true });
        }
        
    }

    static async getAll(req: Request, res: Response) {
        const allUsers = await ParticipanteModel.find();
        res.json(allUsers);
    }
}

export default ParticipanteController;