import { modelOptions, prop } from "@typegoose/typegoose";

import { usuariosEnum } from "../types/enums";
import { InstituicaoQuery, ParticipanteQuery, UsuarioQuery } from "../types/types";


@modelOptions({ schemaOptions: { _id: false } })
class IdentificacaoUsuario {
    @prop({ required: true })
    public nome!: string;

    @prop()
    public username?: string;

    @prop()
    public idUsuario?: string;

    public static gerarIdentificacao(usuario: UsuarioQuery | ParticipanteQuery | InstituicaoQuery) {
        if(usuario === null)
            throw new Error("Não é possível gerar a identificação de um usuário nulo.");

        if(usuario.tipo === usuariosEnum.Instituicao || usuario.tipo === usuariosEnum.Participante) {
            return {
                username: usuario!.username,
                idUsuario: usuario!._id,
                nome: usuario.nomeUsuario()
            };
        } else
            throw new Error("Não é possível gerar a identificação deste tipo de usuário: " + usuario.tipo);
    }
}

export { IdentificacaoUsuario };