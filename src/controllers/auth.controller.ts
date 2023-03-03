/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import { UsuarioModel } from "../model/usuario.model";

import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";
import validarSenha from "../util/validarSenha";


class AuthController {

    /**
     * Verifica se há algum usuário que possua ao e-mail passado
     * e se as credenciais enviadas em **req.body** estão corretas
     * 
     * Caso sejam válidas, é gerado um **Refresh Token** que é colocado nos cookies
     * e um **Access Token** que é retornado em JSON como resposta.
     */
    public static async login(req: Request, res: Response) {
        const { email, senha } = req.body;
        
        if(!email || !senha)
            return res.status(400).json({ msg: "E-mail e senha são obrigatórios" });

        const usuario = await UsuarioModel.findOne({ email });
        if(!usuario)
            return res.status(404).json({ msg: "Usuário não encontrado" });
        
        const senhaCorreta = await usuario.verificarSenha(senha);
        if(!senhaCorreta)
            return res.status(400).json({ msg: "Senha incorreta" });
        
        const { token: refreshToken, dataExpiracao } = gerarRefreshToken({ id: usuario._id, email: usuario.email });
        const accessToken = gerarAccesToken({ id: usuario._id, email: usuario.email });

        usuario.refreshToken.push(refreshToken);
        usuario.save();

        res.cookie("token", refreshToken, { expires: dataExpiracao });
        return res.json({ token: accessToken });
    }

    /**
     * Realiza o logout do usuário removendo seu Refresh Token atual de seus cookies
     * e de seu documento no banco de dados, tornando-o inutilizável.
     */
    public static async logout(req: Request, res: Response) {
        if(!req.cookies?.token)
            return res.status(404).json({ msg: "Usuário não está autenticado" });
        
        const refreshToken: string = req.cookies.token;
        const usuarioComToken = await UsuarioModel.findOne({ refreshToken });
        if(!usuarioComToken)
            return res.status(404).json({ msg: "Token inválido" });

        usuarioComToken.removerRefreshToken(refreshToken);

        // Remover refresh token dos cookies
        res.clearCookie("token");

        return res.status(200).json({ msg: "Usuário deslogado com sucesso" });
    }

    /**
     * Gera um novo Access Token caso o Refresh Token dos cookies seja válido,
     * para que o usuário possa acessar rotas que necessitam de autenticação.
     */
    public static async gerarNovoAccessToken(req: Request, res: Response) {
        if(!req.cookies?.token)
            return res.status(401).json({ msg: "Usuário não está autenticado" });
        
        const refreshToken = req.cookies.token;
        const usuarioComToken = await UsuarioModel.findOne({ refreshToken });
        if(!usuarioComToken)
            return res.status(401).json({ msg: "Token inválido" });
        
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            (err: any, payload: any) => {
                if(err || !(<JwtPayload>payload).userId) {
                    return res.status(200).json({ msg: "Token inválido" });
                }
                else {
                    const novoAccessToken = gerarAccesToken({ id: usuarioComToken._id, email: usuarioComToken.email });
                    return res.json({ token: novoAccessToken });
                }
            }
        );
    }
    
    static async atualizarSenha(req: Request, res: Response) {
        const { senhaAtual, novaSenha } = req.body;
        const usuario = await UsuarioModel.findById(res.locals.userId);
        if(!usuario)
            return res.status(404).json({ msg: "Erro interno", erro: true });

        if(!await usuario.verificarSenha(senhaAtual))
           return res.status(400).json({ msg: "A senha informada está incorreta", erro: true });

        if(!validarSenha(novaSenha))
            return res.status(400).json({ msg: "A nova senha não atende todos os requisitos de força de senha", erro: true });
        
        usuario.senha = novaSenha;
        usuario.save();
        res.status(200).json({ msg: "Senha atualizada com sucesso" });
    }
}

export default AuthController;