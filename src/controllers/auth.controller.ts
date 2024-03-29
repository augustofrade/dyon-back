/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import Email from "../email/Email";
import { Operador } from "../model/operador.model";
import { UsuarioModel } from "../model/usuario.model";
import gerarAccesToken from "../util/auth/gerarAccessToken";
import gerarRefreshToken from "../util/auth/gerarRefreshToken";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";


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
        
        if(usuario.tipo === "Operador") {
            const usuarioOperador = usuario as unknown as Operador;
            if(!usuarioOperador.confirmado) // precisa definir a senha
                return res.status(403).json({ msg: "Sua conta ainda não foi ativada. Verifique seu e-mail para definir sua senha e ativá-la." });
            else if(!usuarioOperador.ativo)
                return res.status(403).json({ msg: "Não foi possível fazer o login, sua conta está bloqueada, contate seu gestor" });
        } else if(usuario.emailConfirmado === false) {
            // participante e instituição
            // TODO: criar função separada
            const emailToken = gerarTokenGenerico();
            usuario.emailToken = { _id: emailToken.hash, expiracao: emailToken.expiracao };
            await usuario.save();
            Email.Instance.enviarEmailCadastro({ email, tipo: "Participante" }, usuario.nomeUsuario().split(" ")[0], emailToken);
            return res.status(403).json({ msg: "Seu e-mail ainda não foi confirmado, cheque sua caixa de entrada" });
        }

        if(!senhaCorreta)
            return res.status(400).json({ msg: "Senha incorreta" });
        
        const { token: refreshToken, dataExpiracao } = gerarRefreshToken({ id: usuario._id, email: usuario.email });
        const accessToken = gerarAccesToken({ id: usuario._id, email: usuario.email });

        usuario.refreshToken.push(refreshToken);
        usuario.save();

        // colocar secure: true em produção em https
        res.cookie("token", refreshToken, { expires: dataExpiracao });
        return res.json({ dados: { accessToken: accessToken } });
    }

    /**
     * Realiza o logout do usuário removendo seu Refresh Token atual de seus cookies
     * e de seu documento no banco de dados, tornando-o inutilizável.
     */
    public static async logout(req: Request, res: Response) {
        if(!req.cookies?.token)
            return res.status(401).json({ msg: "Usuário não está autenticado" });
        
        const refreshToken: string = req.cookies.token;
        const usuarioComToken = await UsuarioModel.findOne({ refreshToken });
        if(!usuarioComToken)
            return res.status(401).json({ msg: "Token inválido" });

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
                    return res.json({ dados: { accessToken: novoAccessToken } });
                }
            }
        );
    }
}

export default AuthController;