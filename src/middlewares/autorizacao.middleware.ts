import { NextFunction, Request, Response } from "express";

import { InstituicaoModel, OperadorModel, ParticipanteModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";

export const authParticipante = async (req: Request, res: Response, next: NextFunction) => {
    const participante = await ParticipanteModel.findById(req.userId);
    if(!participante)
        return res.json({ msg: "Não autorizado", erro: true });
    
    req.participante = participante;
    next();
};

export const authUsuario = async (req: Request, res: Response, next: NextFunction) => {
    const usuario = await UsuarioModel.findById(req.userId);
    if(!usuario)
        return res.json({ msg: "Não autorizado", erro: true });

    req.usuario = usuario;
    next();
};

export const authInstituicao = async (req: Request, res: Response, next: NextFunction) => {
    const instituicao = await InstituicaoModel.findById(req.userId);
    if(!instituicao)
        return res.json({ msg: "Não autorizado", erro: true });
    
    req.instituicao = instituicao;
    next();
};

export const authOperador = async (req: Request, res: Response, next: NextFunction) => {
    const operador = await OperadorModel.findById(req.userId);
    if(!operador)
        return res.json({ msg: "Não autorizado", erro: true });
    else if(!operador.confirmado)
        return res.json({ msg: "Não autorizado: sua conta ainda não foi ativada", erro: true });
    else if(!operador.ativo)
        return res.json({ msg: "Não autorizado: Sua conta está bloqueada, contate seu gestor", erro: true });

    req.operador = operador;
    next();
};
