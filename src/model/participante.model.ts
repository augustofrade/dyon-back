import mongoose from "mongoose";
import Usuario, { IUsuario, UsuarioModel } from "./usuario.model";

export interface IParticipante extends IUsuario {
    nomeCompleto: string;
    cpf: string;
}

const participanteSchema = new mongoose.Schema<IParticipante, UsuarioModel>(
    {
        nomeCompleto: {
            type: String,
            require: true
        },
        cpf: {
            type: String,
            require: true
        }
    },
    {
        discriminatorKey: "kind"
    }
);

const Participante = Usuario.discriminator<IParticipante, UsuarioModel>("Participante", participanteSchema);

export default Participante;