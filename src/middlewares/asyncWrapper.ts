/* eslint-disable no-unused-vars */

import { Request, Response, NextFunction } from "express";


type callbackFn = (req: Request, res: Response, next: NextFunction) => void;

const asyncWrapper = (fn: callbackFn) => (req: Request, res: Response, next: NextFunction) => {
    return Promise
        .resolve(fn(req, res, next))
        .catch(err => {
            console.log(err);
            res.json({ msg: "Um erro ocorreu ao tentar acessar esta rota, tente novamente", erro: true });
        });
};

export default asyncWrapper;