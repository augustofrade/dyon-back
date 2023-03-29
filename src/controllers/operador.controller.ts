import { InstituicaoModel } from "../model/models";
import { Request, Response } from "express";
import Email from "../email/Email";
import { OperadorModel } from "../model/models";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { nanoid } from "nanoid";
import validarSenha from "../util/validarSenha";

export default abstract class OperadorController {

    static async cadastro(req: Request, res: Response) {
        const { nomeCompleto, telefone, email } = req.body;
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
            res.status(200).json({ msg: "Cadastro realizado com sucesso" });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async alternarEstadoConta(req: Request, res: Response) {
        try {
            const operador = await OperadorModel.findById(req.body.idOperador);
            if(!operador)
                return res.status(404).json({ msg: "Operador não encontrado", erro: true });
                
            if(!req.instituicao!.operadores.includes(req.body.idOperador))
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
            if(!req.instituicao!.operadores.includes(req.body.idOperador))
                return res.json({ msg: "Não autorizado: este operador não pertence à sua instituição", erro: true });

            const deletada = await OperadorModel.findByIdAndDelete(req.body.idOperador);
            if(deletada) {
                req.instituicao!.operadores = req.instituicao!.operadores.filter(o => o._id !== req.body.idOperador);
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
        const operador = await OperadorModel.findById(req.body.idOperador);
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
        
        operador.senhaToken = undefined;
        operador.senha = req.body.senha;
        operador.ativo = true;
        operador.confirmado = true;
        operador.emailConfirmado = true;

        try {
            await operador.save();
            Email.Instance.enviarEmailAlteracaoSenha(operador.email, operador.nomeCompleto);
            res.status(201).json({ msg: "Senha definida e conta ativada com sucesso" });
        } catch (err) {
            Email.Instance.enviarEmailFalhaSenha(operador.email, operador.nomeCompleto);
            res.status(400).json({ msg: "Não foi possível ativar sua conta, contate seu gestor" });
        }
    }

    // TODO: método para visualização de eventos com períodos ocorrendo em tempo real 
}