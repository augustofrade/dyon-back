import { ParticipanteModel, OperadorModel, InstituicaoModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";

const retornoUsuario = async () => await UsuarioModel.findById();
const retornoParticipante = async () => await ParticipanteModel.findById();
const retornoInstituicao = async () => await InstituicaoModel.findById();
const retornoOperador = async () => await OperadorModel.findById();


declare module "express-serve-static-core" {
    interface Request {
        userId: string | null;
        usuario: Awaited<ReturnType<typeof retornoUsuario>>;
        participante: Awaited<ReturnType<typeof retornoParticipante>>;
        instituicao: Awaited<ReturnType<typeof retornoInstituicao>>;
        operador: Awaited<ReturnType<typeof retornoOperador>>;
    }
}