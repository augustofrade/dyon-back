import { DateTime } from "luxon";
import { ITokenGenerico } from "./../types/interface";
import crypto from "crypto";

export const gerarTokenGenerico = (): ITokenGenerico => {
    const dataExpiracao = DateTime.now().plus({ minutes: 15 }).toJSDate();
    return {
        hash: crypto.randomBytes(32).toString("hex"),
        expiracao: dataExpiracao
    };
};