/* eslint-disable no-unused-vars */
import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface IUsuario {
    username: string;
    email: string;
    senha: string;
    emailConfirmado: boolean;
}


export interface UsuarioModel extends mongoose.Model<IUsuario> {
    findByEmail(email: string): IUsuario
}


const UsuarioSchema = new mongoose.Schema<IUsuario, UsuarioModel>(
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
        discriminatorKey: "tipo",
        timestamps: true,
        statics: {
            async findByEmail (email: string) {
                return this.findOne({ email });
            },
        }
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
UsuarioSchema.methods.comparePassword = function (password: string, cb: any) {
    bcrypt.compare(password, this.password, function (err, result) {
        if(err) return cb(err);

        cb(null, result);
    });
};

UsuarioSchema.pre("save", function (next) {
    // Middleware pré-salvamento de algum usuário para transformar a senha em hash.

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const usuario = this;
    const saltFactor = 10;

    // Apenas transformar em hash se a senha foi alterada ou o usuário está sendo cadastrado
    if(!usuario.isModified("senha")) return next();

    bcrypt.genSalt(saltFactor, function (err, salt) {
        if(err) return next(err);
        
        // realizar hash da senha
        bcrypt.hash(usuario.senha, salt, function (err, hashSenha) {
            if(err) return next(err);
            usuario.senha = hashSenha;
            next();
        });
    });
});

const Usuario = mongoose.model<IUsuario, UsuarioModel>("Usuario", UsuarioSchema);

export default Usuario;