import { Types } from "mongoose";
import { pre, prop, modelOptions, getModelForClass, DocumentType, ReturnModelType } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import gerarIdAleatorio from "../util/gerarIDAleatorio";

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
    @prop({ unique: true, index: true, default: () => gerarIdAleatorio() })
    public _publicId!: string;

    @prop({ required: true, index: true, unique: true })
    public email!: string;

    @prop({ required: true })
    public senha!: string;

    @prop({ default: false })
    public emailConfirmado!: string;

    @prop({ default: [], type: String })
    public refreshToken!: Types.Array<string>;


    async checkPassword(this: DocumentType<Usuario>, password: string) {
        const senhasConferem = bcrypt.compare(password, this.senha);
        return senhasConferem;
    }

    static async findByEmail(this: ReturnModelType<typeof Usuario>, email: string) {
        return this.findOne({ email });
    }
}


const UsuarioModel = getModelForClass(Usuario);

export { UsuarioModel, Usuario };