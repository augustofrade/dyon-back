import { DateTime } from "luxon";
import { ITokenGenerico } from "./../types/interface";
import crypto from "crypto";

export const gerarTokenGenerico = (minutos = 10): ITokenGenerico => {
    const dataExpiracao = DateTime.now().plus({ minutes: minutos }).toJSDate();
    return {
        hash: crypto.randomBytes(32).toString("hex"),
        expiracao: dataExpiracao
    };
};