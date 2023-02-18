import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


/**
 * Middlware para verificar se o usuário já está logado, isto é:
 * - Possui um Refresh Token nos cookies
 * - O Refresh Token é válido
 * 
 * É utilizado na rota de login para que **não seja necessário realizar a verificação na mesma**
 */
const authValidarRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies.token;
    if(!refreshToken) {
        // Não possui refresh token, logo pode tentar efetuar login
        next();
    } else {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string,
            (err, payload) => {
                if(err || !(<JwtPayload>payload).userId ) {
                    // Caso o token seja inválido
                    res.clearCookie("token");
                    next();
                } else {
                    return res.status(200).json({ msg: "Usuário já autenticado" });
                }
            }
        );
    }
        
};

export default authValidarRefreshToken;