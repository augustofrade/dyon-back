import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

/**
 * Middle para validar opcionalmente se o usuário está logado.
 */
const authOpcional  = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader: string | undefined = req.headers["authorization"];
    if(!authHeader) {
        next();
    } else {
        const accessToken: string = authHeader.split(" ")[1];

        const secret = process.env.ACCESS_TOKEN_SECRET as string;
        jwt.verify(accessToken, secret, (err, payload) => {
            if(err) { // Access Token invalido
                res.locals.userId = null;
                next();
            } else {  // Token valido
                res.locals.userId = (<jwt.JwtPayload>payload).userId;
                next();
            }
        });
    }
};

export default authOpcional;