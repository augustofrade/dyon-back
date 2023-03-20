import { Request, Response } from "express";

import Email from "../email/Email";
import { UsuarioModel } from "../model/usuario.model";
import { usuariosEnum } from "../types/enums";
import { gerarTokenGenerico } from "./../util/gerarTokenGenerico";

/* eslint-disable @typescript-eslint/no-non-null-assertion */

export default abstract class EmailController {

    static async confirmarEmail(req: Request, res: Response) {
        const usuario = await UsuarioModel.findOne({ "emailToken._id": req.body.token });
        
        if(!usuario)
            return res.status(404).json({ msg: "Token de confirmação de e-mail inválido", erro: true });
        if(usuario.emailConfirmado)
            return res.status(201).json({ msg: "Seu e-mail já foi confirmado", erro: true });
        else if(new Date() > usuario.emailToken!.expiracao)
            return res.status(400).json({ msg: "O token de confirmação de e-mail já expirou", erro: true });
        
        try {

            usuario.emailToken = undefined;
            usuario.emailConfirmado = true;
            usuario.save();
            res.status(200).json({ msg: "E-mail confirmado com sucesso" });
        } catch (err) {
            res.json({ msg: "Não foi possível confirmar seu e-mail, tente novamente.", erro: true });
        }
    }

    static async novoToken(req: Request, res: Response) {
        const usuario = await UsuarioModel.findById(res.locals.userId);
        if(!usuario)
            return res.status(404).json({ msg: "Você não está autenticado", erro: true });
        if(usuario.tipo !== <string>usuariosEnum.Instituicao && usuario.tipo !== <string>usuariosEnum.Participante)
            return res.status(404).json({ msg: "Você não está autorizado", erro: true });
        if(usuario.emailConfirmado)
            return res.status(404).json({ msg: "Seu e-mail já foi confirmado" });
        
        const novoToken = gerarTokenGenerico();
        usuario.emailToken = {
            _id: novoToken.hash,
            expiracao: novoToken.expiracao
        };
        usuario.save();
        Email.Instance.enviarEmailConfirmacao(usuario.email, usuario.nomeUsuario(), novoToken);
        res.json({ msg: "Um novo token para confirmar seu e-mail foi gerado, verifique seu e-mail" });
    }
}