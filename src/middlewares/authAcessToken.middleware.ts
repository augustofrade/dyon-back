import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Middlware para validar se o Acess Token é válido, isto é:
 * - Se foi passado no cabeçalho de Authorization da requisição
 * - Se não sofreu alterações (jwt.verify())
 * - Se já expirou
 */
const authAcessToken  = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader: string | undefined = req.headers["authorization"];
    if(!authHeader) {
        res.status(401).json({ msg: "Token inválido" });
    } else {
        const accessToken: string = authHeader.split(" ")[1];

        const secret = process.env.ACCESS_TOKEN_SECRET as string;
        jwt.verify(accessToken, secret, (err, payload) => {
            if(err) // Access Token invalido
                res.status(401).json({ msg: "Token inválido" });
            else {  // Token valido
                req.userId = (<jwt.JwtPayload>payload).userId;
                next();
            }
        });
    }
};

export default authAcessToken;