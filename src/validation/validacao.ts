import { NextFunction, Request, Response } from "express";
import { ValidationChain, validationResult } from "express-validator";

const validacao = (validacoes: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        await Promise.all(validacoes.map((validacao) => validacao.run(req)));

        const result = validationResult(req);
        if (result.isEmpty())
            return next();

        return res.send({
            msg: result.array()[0].msg,
            erro: true
        });
    };
};

export default validacao;