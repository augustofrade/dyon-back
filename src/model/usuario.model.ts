import { DocumentType, getModelForClass, modelOptions, pre, prop } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { Types } from "mongoose";

import { TokenGenerico } from "../schema/tokenGenerico.schema";
import { usuariosEnum } from "../types/enums";
import { IInfoResumida, ITokenGenerico } from "../types/interface";
import { Documento } from "../types/types";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";
import { Inscricao } from "./inscricao.model";
import { Instituicao } from "./instituicao.model";
import { AvaliacaoModel, EventoModel, InscricaoModel, OperadorModel, PeriodoModel } from "./models";
import { Operador } from "./operador.model";
import { Participante } from "./participante.model";

@pre<Usuario>("save", function(next) {
    // Middleware pré-salvamento de algum usuário para transformar a senha em hash.

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
@pre<Usuario>("remove", async function() {
    if(this.tipo === usuariosEnum.Participante) {
        const inscricoes: string[] = await InscricaoModel.find({ "participante._id": this._id }).map((i: Documento<Inscricao>) => i._id);
        
        InscricaoModel.deleteMany({ "participante._id": this._id });
        EventoModel.updateMany({ "inscricao._id": { $in: inscricoes } });
        AvaliacaoModel.removerIdentificacaoAutor(this._id);
    } else if(this.tipo === usuariosEnum.Instituicao) {
        const user = this as unknown as Instituicao;
        const eventos = user.eventos.map((e) => e._id);
        PeriodoModel.deleteMany({ "evento._id": { $in: user.eventos } });
        EventoModel.deleteMany({ "criador._id": this._id });
        OperadorModel.deleteMany({ "instituicao._id": this._id });
        AvaliacaoModel.removerIdentificacaoInstituicao(this._id);
    }
}, { document: true, query: false })
@modelOptions({ schemaOptions: { discriminatorKey: "tipo", timestamps: true } })
class Usuario {
    @prop({ unique: true, index: true })
    public username!: string;

    @prop({ required: true, index: true, unique: true })
    public email!: string;

    @prop({ required: true, minlength: 6 })
    public senha!: string;

    @prop()
    public senhaToken?: TokenGenerico;

    @prop({ default: false })
    public emailConfirmado!: boolean;

    @prop()
    public emailToken?: TokenGenerico;

    @prop({ default: [], type: [String] })
    public refreshToken!: Types.Array<string>;

    // Definição explícita para ser usado no código
    @prop({ enum: usuariosEnum })
    public tipo!: string;


    public async verificarSenha(this: DocumentType<Usuario>, senha: string) {
        const senhasConferem = bcrypt.compare(senha, this.senha);
        return senhasConferem;
    }

    public async novaSenhaToken(this: DocumentType<Usuario>): Promise<ITokenGenerico> {
        const token = gerarTokenGenerico();
        this.senhaToken = {
            _id: token.hash,
            expiracao: token.expiracao
        };
        await this.save();
        return token;
    }

    public async removerRefreshToken(this: DocumentType<Usuario>, refreshToken: string) {
        this.refreshToken.pull(refreshToken);
        this.save();
    }

    public async adicionarRefreshToken(this: DocumentType<Usuario>, refreshToken: string) {
        this.refreshToken.push(refreshToken);
        this.save();
    }

    public nomeUsuario(this: DocumentType<Usuario>): string {
        let nome = "";
        switch (this.tipo) {
            case usuariosEnum.Instituicao:
                nome = (<Instituicao>(<unknown>this)).nomeFantasia;
                break;
            case usuariosEnum.Participante:
                nome = (<Participante>(<unknown>this)).nomeCompleto;
                break;
            case usuariosEnum.Operador:
                nome = (<Operador>(<unknown>this)).nomeCompleto;
                break;
        }
        return nome;
    }

    public async dadosCabecalho(this: DocumentType<Usuario>): Promise<IInfoResumida> {
        const retorno: IInfoResumida = { id: this._id, username: this.username, fotoPerfil: null, nome: "" }
        if(this.tipo === usuariosEnum.Instituicao) {
            const u = <unknown>this as Instituicao;
            retorno.nome = u.nomeFantasia,
            retorno.fotoPerfil = u.fotoPerfil ? u.fotoPerfil.toString("base64") : null;

        } else if(this.tipo === usuariosEnum.Participante) {
            const u = <unknown>this as Participante;
            retorno.nome = u.nomeSocial ?? u.nomeCompleto,
            retorno.fotoPerfil = u.fotoPerfil ? u.fotoPerfil.toString("base64") : null;

        } else if(this.tipo === usuariosEnum.Operador) {
            const u = <unknown>this as Operador;
            retorno.nome = u.nomeCompleto;
            retorno.instituicao = u.instituicao.nome;
        }
        return retorno;
    }
}


const UsuarioModel = getModelForClass(Usuario);

export { UsuarioModel, Usuario };