import { usuariosEnum } from "./../types/enums";
import { TokenGenerico } from "../schema/tokenGenerico.schema";
import { Types } from "mongoose";
import { pre, prop, modelOptions, getModelForClass, DocumentType } from "@typegoose/typegoose";
import bcrypt from "bcrypt";

@pre<Usuario>("save", function(next) {
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
})
@modelOptions({ schemaOptions: { discriminatorKey: "tipo", timestamps: true } })
class Usuario {
    @prop({ unique: true, index: true })
    public username!: string;

    @prop({ required: true, index: true, unique: true })
    public email!: string;

    @prop({ required: true, minlength: 6 })
    public senha!: string;

    @prop({ default: false })
    public emailConfirmado!: string;

    @prop()
    public emailToken?: TokenGenerico;

    @prop({ default: [], type: [String] })
    public refreshToken!: Types.Array<string>;

    // Definição explícita para ser usado no código
    @prop({ enum: usuariosEnum })
    public tipo!: string;


    async verificarSenha(this: DocumentType<Usuario>, senha: string) {
        const senhasConferem = bcrypt.compare(senha, this.senha);
        return senhasConferem;
    }
}


const UsuarioModel = getModelForClass(Usuario);

export { UsuarioModel, Usuario };