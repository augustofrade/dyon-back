import { InstituicaoQuery, ParticipanteQuery, OperadorQuery, UsuarioQuery } from "./types";


declare module "express-serve-static-core" {
    interface Request {
        userId: string | null;
        usuario: UsuarioQuery;
        participante: ParticipanteQuery;
        instituicao: InstituicaoQuery;
        operador: OperadorQuery;
    }
}