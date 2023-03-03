import { Request, Response } from "express";
import Email from "../email/Email";
import { Inscricao } from "../model/inscricao.model";
import { ParticipanteModel } from "../model/models";
import { ICategoria } from "../types/interface";
import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import validarSenha from "../util/validarSenha";
import { buscarCategorias } from "../util/buscarCategorias";


class ParticipanteController {

    static async cadastro(req: Request, res: Response) {
        const { email, senha, nomeCompleto, cpf, telefone, endereco, dataNascimento, genero, categoriasFavoritas } = req.body;
        if(!validarSenha(senha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        try {
            const emailToken = gerarTokenGenerico();
            const novoParticipante = new ParticipanteModel({
                email, senha, nomeCompleto, telefone, genero,
                cpf, dataNascimento,
                categoriasFavoritas: await buscarCategorias(categoriasFavoritas),
                endereco,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novoParticipante.save();
            Email.Instance.enviarEmailDeCadastro(email, novoParticipante.nomeCompleto.split(" ")[0], emailToken);

            const { token: refreshToken, dataExpiracao } = gerarRefreshToken({ id: novoParticipante._id, email: novoParticipante.email });
            const accessToken = gerarAccesToken({ id: novoParticipante._id, email: novoParticipante.email });
            
            res.cookie("token", refreshToken, { expires: dataExpiracao });
            res.status(200).json({ msg: "Cadastro realizado com sucesso", token: accessToken });
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
        
        const categorias: ICategoria[] = participante.categoriasFavoritas.map(c => <ICategoria>{ slug: c._id, titulo: c.titulo });

        const retorno = {
            ...participante.toObject(),
            categorias,
            quantiaEventos: participante.inscricoes.filter(i => (<Inscricao>i).confirmada).length,
            categoriasFavoritas: undefined
        };

        res.status(201).json(retorno);
    }

    static async atualizarDados(req: Request, res: Response) {
        try {
            const novaFoto = req.file ? req.file.buffer : undefined;
            const participante = await ParticipanteModel.atualizarPerfil(res.locals.userId, req.body, novaFoto);
            if(!participante)
                throw new Error();

            // TODO: verificar melhor maneira de enviar a foto do perfil para o front em todas as rotas
            const fotoPerfil = participante.fotoPerfil ? participante.fotoPerfil?.toString("base64") : undefined;
            const dados = { ...participante.toObject(), fotoPerfil };
            res.json({ msg: "", dados });
        } catch (err) {
            res.json({ msg: "Não foi possível atualizar os dados, tente novamente.", erro: true });
        }
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