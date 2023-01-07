/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcrypt";

export interface IUsuario {
    username: string;
    email: string;
    senha: string;
    emailConfirmado: boolean;
    refreshToken: string[];
}


// Métodos de instância
export interface IUsuarioDocument extends IUsuario, Document {
    checkPassword: (password: string) => Promise<boolean>;
}

// Métodos estáticos
export interface IUsuarioModel extends Model<IUsuarioDocument> {
    findByEmail: (email: string) => Promise<IUsuarioDocument>;
}

const UsuarioSchema: Schema<IUsuarioDocument> = new Schema(
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
        refreshToken: {
            type: [String],
            default: []
        }
    },
    {
        discriminatorKey: "tipo",
        timestamps: true
    }
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
UsuarioSchema.methods.checkPassword = async function (password: string) {
    const senhasConferem = bcrypt.compare(password, this.senha);
    return senhasConferem;
};

UsuarioSchema.statics.findByEmail = async function (email: string) {
    return this.findOne({ email });
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

const Usuario = mongoose.model<IUsuarioDocument, IUsuarioModel>("Usuario", UsuarioSchema);

export default Usuario;