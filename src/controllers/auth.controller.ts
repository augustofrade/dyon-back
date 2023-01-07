/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";

import Usuario from "../model/usuario.model";

import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";


/**
 * Controller direcionado às ações de autenticação que um usuário pode tomar:
 * 
 * - Login
 * - Logout
 * - Accesar rota protegida
 */
class AuthController {

    /**
     * ROTA DE LOGIN
     * 
     * Verifica se há algum usuário que possua ao e-mail passado
     * e se as credenciais enviadas em **req.body** estão corretas
     * 
     * Caso sejam válidas, é gerado um **Refresh Token** que é colocado nos cookies
     * e um **Access Token** que é retornado em JSON como resposta
     * @param req Objeto de Requisição
     * @param res Objeto de Resposta
     * @returns Response
     */
    public static async login(req: Request, res: Response) {
        const { email, senha } = req.body;
        
        if(!email || !senha)
            return res.status(400).json({ msg: "E-mail e senha são obrigatórios" });

        const usuario = await Usuario.findByEmail(email);
        if(!usuario)
            return res.status(204).json({ msg: "Usuário não encontrado" });
        
        const senhaCorreta = await usuario.checkPassword(senha);
        if(!senhaCorreta)
            return res.status(403).json({ msg: "Senha incorreta" });
        
        const refreshToken = gerarRefreshToken(usuario);

        const accessToken = gerarAccesToken(usuario);

        usuario.refreshToken.push(refreshToken);
        usuario.save();

        res.cookie("token", refreshToken, { maxAge: 5 * 60 * 1000 });
        return res.json({ token: accessToken });
    }

    /**
     * ROTA DE LOGOUT
     * 
     * Realiza o logout do usuário removendo seu Refresh Token atual de seus cookies
     * e de seu documento no banco de dados, tornando-o inutilizável.
     * @param req Objeto de Requisição
     * @param res Objeto de Resposta
     * @returns Response
     */
    public static async logout(req: Request, res: Response) {
        // Verificar se foi passado um token
        if(!req.cookies?.token)
            return res.status(204).json({ msg: "Usuário não está autenticado" });
        
        const refreshToken: string = req.cookies.token;        
        const usuarioComToken = await Usuario.findOne({ refreshToken });
        // Verificar se algum usuário possui esse token
        if(!usuarioComToken)
            return res.status(204).json({ msg: "Token inválido" });

        // Remover token da lista de Refresh Tokens do usuário
        usuarioComToken.refreshToken = usuarioComToken.refreshToken.filter(token => token !== refreshToken);
        usuarioComToken.save();
        // Remover refresh token dos cookies
        res.clearCookie("token");

        return res.status(200).json({ msg: "Usuário deslogado com sucesso" });
    }

    /**
     * Gera um novo Access Token caso o Refresh Token dos cookies seja válido,
     * para que o usuário possa acessar rotas que necessitam de autenticação.
     * @param req Objeto da Requisição
     * @param res Objeto da Resposta
     * @returns Response
     */
    public static async gerarNovoAccessToken(req: Request, res: Response) {
        if(!req.cookies?.token)
            return res.status(401).json({ msg: "Usuário não está autenticado" });
        
        const refreshToken = req.cookies.token;
        const usuarioComToken = await Usuario.findOne({ refreshToken });
        if(!usuarioComToken)
            return res.status(401).json({ msg: "Token inválido" });
        
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            (err: any, payload: any) => {
                if(err || !(<JwtPayload>payload).idUser) {
                    return res.status(403).json({ msg: "Token inválido" });
                }
                else {
                    const novoAccessToken = gerarAccesToken(usuarioComToken);
                    return res.json({ token: novoAccessToken });
                }
            }
        );
    }
}

export default AuthController;