import { Instituicao } from "../model/instituicao.model";
import { Operador } from "../model/operador.model";
import { Participante } from "../model/participante.model";

declare module "express-serve-static-core" {
    interface Request {
        userId: string | null;
        participante: Participante;
        instituicao: Instituicao;
        operador: Operador;
    }
}