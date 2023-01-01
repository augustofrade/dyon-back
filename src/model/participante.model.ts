import mongoose from "mongoose";
import Usuario, { IUsuario, UsuarioModel } from "./usuario.model";
import EnderecoSchema, { IEndereco } from "../schema/endereco.schema";

export interface IParticipante extends IUsuario {
    nomeCompleto: string;
    cpf: string;
    endereco: IEndereco
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ParticipanteModel extends UsuarioModel {
    // Adicionar métodos próprios mais tarde
}

const ParticipanteSchema = new mongoose.Schema<IParticipante, ParticipanteModel>(
    {
        nomeCompleto: {
            type: String,
            required: true
        },
        cpf: {
            type: String,
            required: true
        },
        endereco: EnderecoSchema
    }
);

const Participante = Usuario.discriminator<IParticipante, ParticipanteModel>("Participante", ParticipanteSchema);

export default Participante;