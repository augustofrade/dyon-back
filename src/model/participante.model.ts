import mongoose from "mongoose";
import Usuario, { IUsuario, UsuarioModel } from "./usuario.model";
import enderecoSchema, { IEndereco } from "../schema/endereco.schema";

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
            require: true
        },
        cpf: {
            type: String,
            require: true
        },
        endereco: enderecoSchema
    }
);

const Participante = Usuario.discriminator<IParticipante, ParticipanteModel>("Participante", ParticipanteSchema);

export default Participante;