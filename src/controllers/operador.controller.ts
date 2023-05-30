/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import { nanoid } from "nanoid";

import Email from "../email/Email";
import { EventoModel, InstituicaoModel, OperadorModel } from "../model/models";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import validarSenha from "../util/validarSenha";
import { UsuarioModel } from "../model/usuario.model";

export default abstract class OperadorController {

    static async cadastro(req: Request, res: Response) {
        const { nomeCompleto, telefone, email } = req.body;
        const emailEmUso = await UsuarioModel.findOne({ email: email });
        if(emailEmUso)
            return res.status(400).json({ msg: "O e-mail fornecido já está em uso no Dyon", erro: true });

        try {
            const senhaToken = gerarTokenGenerico(180);

            const novoOperador = new OperadorModel({
                nomeCompleto,
                telefone,
                email,
                senha: nanoid(10),
                instituicao: IdentificacaoUsuario.gerarIdentificacao(req.instituicao),
                senhaToken: { _id: senhaToken.hash, expiracao: senhaToken.expiracao }
            });
            await novoOperador.save();
            await InstituicaoModel.findByIdAndUpdate(req.userId, { $push: { operadores: novoOperador._id } });
            Email.Instance.enviarEmailOperador(email, novoOperador.nomeCompleto.split(" ")[0], req.instituicao!.nomeFantasia, senhaToken);
            res.status(200).json({ msg: `Cadastro de ${nomeCompleto} realizado com sucesso. Um e-mail de ativação de conta foi enviado.` });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async atualizarConta(req: Request, res: Response) {
        const { nomeCompleto, telefone, email } = req.body;
        const idOperador = req.params.idOperador;
        try {
            const operador = await OperadorModel.findByIdAndUpdate(idOperador, {
                nomeCompleto,
                telefone,
                email
            });
            
            if(operador)
                res.status(200).json({ msg: "Dados do operador salvos com sucesso" });
            else
                res.status(400).json({ msg: "Operador não encontrado, tente novamente", erro: true });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao tentar salvar os dados deste operador, tente novamente", erro: true });
        }
    }

    static async alternarEstadoConta(req: Request, res: Response) {
        const { idOperador } = req.params;
        try {
            const operador = await OperadorModel.findById(idOperador);
            if(!operador)
                return res.status(404).json({ msg: "Operador não encontrado", erro: true });
                
            if(!req.instituicao!.operadores.includes(idOperador as any))
                return res.json({ msg: "Não autorizado: este operador não pertence à sua instituição", erro: true });
            
            operador.ativo = !(operador.ativo);
            await operador.save();
            const nome = operador.nomeCompleto.split(" ")[0];
            const operacaoRealizada = operador.ativo ? "ativada" : "desativada";
            res.status(200).json({ msg: `A conta de ${nome} foi ${operacaoRealizada} com sucesso` });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao tentar ativar/desativar a conta deste operador", erro: true });
        }
    }
    
    static async excluirConta(req: Request, res: Response) {
        try {
            const { idOperador } = req.params;
            if(!req.instituicao!.operadores.includes(idOperador as any))
                return res.json({ msg: "Não autorizado: este operador não pertence à sua instituição", erro: true });

            const deletada = await OperadorModel.findByIdAndDelete(idOperador);
            if(deletada) {
                req.instituicao!.operadores = req.instituicao!.operadores.filter(o => o._id !== idOperador);
                await req.instituicao!.save();
                res.status(200).json({ msg: "A conta deste operador foi excluída com sucesso " });
            }
            else
                throw new Error();
        } catch (err) {
            res.status(400).json({ msg: "Não foi possível excluir a conta deste operador, tente novamente.", erro: true });
        }
    }

    static async solicitarTrocaSenha(req: Request, res: Response) {
        const operador = await OperadorModel.findById(req.params.idOperador as any);
        if(!operador)
            return res.json({ msg: "Operador não encontrado", erro: true });
        
        try {
            const token = await operador.novaSenhaToken();
            
            if(operador.confirmado) {
                Email.Instance.enviarEmailRecuperacaoSenha(operador.email, operador.nomeCompleto, token);
                res.json({ msg: "Foi enviado um e-mail de troca de senha para " + operador.nomeCompleto });
            }
            else {
                Email.Instance.enviarEmailAtivacaoOperador(operador.email, operador.nomeCompleto, operador.instituicao.nome, token);
                res.json({ msg: "Foi enviado um e-mail de ativação de conta para " + operador.nomeCompleto });
            }
        } catch (err) {
            res.json({ msg: "Não foi possível enviar um e-mail de troca de senha para " + operador.nomeCompleto, erro: true });
        }
    }

    static async ativacaoUnica(req: Request, res: Response) {
        const operador = await OperadorModel.findOne({ "senhaToken._id": req.body.token });

        if(!operador || !operador.senhaToken)
            return res.status(404).json({ msg: "Token de ativação de conta inválido", erro: true });
        else if(new Date() > operador.senhaToken.expiracao)
            return res.status(400).json({ msg: "O token de ativação de conta já expirou", erro: true });
        else if(req.body.senha !== req.body.confirmarSenha)
            return res.status(400).json({ msg: "As senhas não conferem", erro: true });
        else if(!validarSenha(req.body.senha))
            return res.status(400).json({ msg: "A senha não atende todos os requisitos de força de senha", erro: true });

        try {
            await operador.ativarConta(req.body.senha);
            Email.Instance.enviarEmailAlteracaoSenha(operador.email, operador.nomeCompleto);
            res.status(201).json({ msg: "Senha definida e conta ativada com sucesso" });
        } catch (err) {
            Email.Instance.enviarEmailFalhaSenha(operador.email, operador.nomeCompleto);
            res.status(400).json({ msg: "Não foi possível ativar sua conta, contate seu gestor", erro: true });
        }
    }

    static async listarOperadores(req: Request, res: Response) {
        try {
            const operadores = await OperadorModel.find({
                "instituicao.idUsuario": req.userId!
            }).select("_id nomeCompleto email ativo confirmado telefone");
            res.status(200).json({ dados: operadores });
        } catch (err) {
            res.status(400).json({ msg: "Não foi possível buscar os operadores em sua instituição, tente novamente", erro: true });
        }
    }

    static async paginaInicial(req: Request, res: Response) {
        try {
            const eventos = await EventoModel.gerarCardsPorPeriodo({ operadores: req.userId }, true);
            res.status(200).json({ dados: eventos });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao buscar os eventos em que você está atribuído, tente novamente", erro: true });
        }
    }
}