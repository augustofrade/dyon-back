import { TokenGenerico } from "./../types/interface";
import crypto from "crypto";

export const gerarTokenGenerico = (): TokenGenerico => {
    const dataAtual = new Date();
    const dataExpiracao = new Date(dataAtual.getTime() + 5 * 60000);
    return {
        hash: crypto.randomBytes(32).toString("hex"),
        expiracao: dataExpiracao
    };
};