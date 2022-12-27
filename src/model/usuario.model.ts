/* eslint-disable no-unused-vars */
import mongoose from "mongoose";

export interface IUsuario {
    username: string;
    email: string;
    senha: string;
    emailConfirmado: boolean;
}


export interface UsuarioModel extends mongoose.Model<IUsuario> {
    findByEmail(email: string): IUsuario
}


const usuarioSchema = new mongoose.Schema<IUsuario, UsuarioModel>(
    {
        username: {
            type: String,
            required: true,
            index: true,
            unique: true
        },
        email: {
            type: String,
            require: true,
            index: true,
            unique: true
        },
        senha: {
            type: String,
            require: true,
        },
        emailConfirmado: {
            type: Boolean,
            default: false
        },
        
    },
    {
        discriminatorKey: "kind",
        timestamps: true,
        statics: {
            async findByEmail (email: string) {
                return this.findOne({ email });
            },
        }
    }
);

const Usuario = mongoose.model<IUsuario, UsuarioModel>("Usuario", usuarioSchema);

export default Usuario;