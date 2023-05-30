import { usuariosEnum } from "../types/enums";
import { Request, Response } from "express";

import Email from "../email/Email";
import { UsuarioModel } from "../model/usuario.model";
import validarSenha from "../util/validarSenha";


export default abstract class SenhaController {

    static async atualizarSenha(req: Request, res: Response) {
        const { senhaAtual, novaSenha } = req.body;

        if(!await req.usuario!.verificarSenha(senhaAtual))
           return res.status(400).json({ msg: "A senha informada está incorreta", erro: true });

        if(!validarSenha(novaSenha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        
            req.usuario!.senha = novaSenha;
        try {
            await req.usuario!.save();
            Email.Instance.enviarEmailAlteracaoSenha(req.usuario!.email, req.usuario!.nomeUsuario());
        } catch (err) {
            Email.Instance.enviarEmailFalhaSenha(req.usuario!.email, req.usuario!.nomeUsuario());
        }
        res.status(200).json({ msg: "Senha atualizada com sucesso" });
    }

    static async gerarTokenSenha(req: Request, res: Response) {
        const usuario = await UsuarioModel.findOne({ email: req.body.email });
        if(!usuario)
            return res.json({ msg: "Não foi encontrado um usuário com este e-mail", erro: true });
        
        if(usuario.tipo === usuariosEnum.Operador)
            return res.status(400).json({ msg: "Para alterar sua senha, contate seu gestor", erro: true });
        
        const token = await usuario.novaSenhaToken();

        Email.Instance.enviarEmailRecuperacaoSenha(usuario.email, usuario.nomeUsuario(), token);
        res.json({ msg: "Foi enviado um e-mail de recuperação de senha", erro: true });
    }

    static async tokenRecuperacaoSenhaValido(req: Request, res: Response) {
        const token = req.params.token;
        try {
            const usuario = await UsuarioModel.findOne({ "senhaToken._id": token });
            if(!usuario)
                return res.status(404).json({ msg: "Token de Recuperação de senha inválido", erro: true });
            else if(!usuario.senhaToken)
                return res.status(404).json({ msg: "Você não solicitou um token de recuperação de senha", erro: true });
            else if(new Date() > usuario.senhaToken.expiracao)
                return res.status(403).json({ msg: "O token de recuperação de senha já expirou", erro: true });
            else
                return res.status(200).json({ msg: "Token válido", dados: { nomeOperador: usuario.nomeUsuario() } });
        } catch (err) {
            res.status(400).json({ msg: "Não foi possível validar o token de recuperação de senha", erro: true });
        }
    }

    static async recuperarSenha(req: Request, res: Response) {
        const usuario = await UsuarioModel.findOne({ "senhaToken._id": req.body.token });

        if(!usuario)
            return res.status(404).json({ msg: "Token de Recuperação de senha inválido", erro: true });
        else if(!usuario.senhaToken)
            return res.status(404).json({ msg: "Você não solicitou um token de recuperação de senha", erro: true });
        else if(new Date() > usuario.senhaToken.expiracao)
            return res.status(400).json({ msg: "O token de recuperação de senha já expirou", erro: true });
        else if(req.body.senha !== req.body.confirmarSenha)
            return res.status(400).json({ msg: "As senhas não conferem", erro: true });
        else if(!validarSenha(req.body.senha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        
        usuario.senhaToken = undefined;
        usuario.senha = req.body.senha;

        try {
            await usuario.save();
            Email.Instance.enviarEmailAlteracaoSenha(usuario.email, usuario.nomeUsuario());
            res.status(201).json({ msg: "Senha alterada com sucesso" });
        } catch (err) {
            Email.Instance.enviarEmailFalhaSenha(usuario.email, usuario.nomeUsuario());
            res.status(400).json({ msg: "Não foi possível alterar sua senha", erro: true });
        }
    }
}