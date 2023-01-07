import mongoose from "mongoose";
import Usuario, { IUsuario, IUsuarioModel } from "./usuario.model";
import EnderecoSchema, { IEndereco } from "../schema/endereco.schema";

export interface IInstituicao extends IUsuario {
    nomeFantasia: string;
    sigla: string;
    endereco: IEndereco
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InstituicaoModel extends IUsuarioModel {
    // Adicionar métodos próprios mais tarde
}

export const InstituicaoSchema = new mongoose.Schema<IInstituicao, InstituicaoModel>(
    {
        nomeFantasia: {
            type: String,
            require: true
        },
        sigla: {
            type: String,
            require: true
        },
        endereco: EnderecoSchema
    }
);

const Instituicao = Usuario.discriminator<IInstituicao, InstituicaoModel>("Instituicao", InstituicaoSchema);

export default Instituicao;