import { gerarTokenGenerico } from "./../util/gerarTokenGenerico";
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";

export default abstract class EmailController {

    static async confirmarEmail(req: Request, res: Response) {
        const usuario = await UsuarioModel.findOne({ "emailToken._id": req.body.token });
        
        if(!usuario)
            return res.status(404).json({ msg: "Token de confirmação de e-mail inválido", erro: true });
        if(usuario.emailConfirmado)
            return res.status(201).json({ msg: "Seu e-mail já foi confirmado", erro: true });
        else if(new Date() > usuario.emailToken!.expiracao)
            return res.status(400).json({ msg: "O token de confirmação de e-mail já expirou", erro: true });
        
        usuario.emailToken = undefined;
        usuario.emailConfirmado = true;
        usuario.save();
    }

    static async novoToken(req: Request, res: Response) {
        const usuario = await UsuarioModel.findById(res.locals.userId);
        if(!usuario)
            return res.status(404).json({ msg: "Usuário não autenticado" });
            
        if(usuario.emailConfirmado)
            return res.status(404).json({ msg: "Seu e-mail já foi confirmado" });
        
        const novoToken = gerarTokenGenerico();
        usuario.emailToken = {
            _id: novoToken.hash,
            expiracao: novoToken.expiracao
        };
        usuario.save();
        // TODO: enviar e-mail de geração de token
        res.json({ msg: "Um novo token para confirmar seu e-mail foi gerado, verifique seu e-mail" });
    }
}