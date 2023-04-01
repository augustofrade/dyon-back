import { modelOptions, prop } from "@typegoose/typegoose";

import { EventoQuery } from "../types/types";
import { Endereco } from "./endereco.schema";
import { IdentificacaoUsuario } from "./identificacaoUsuario.schema";


@modelOptions({ schemaOptions: { _id: false } })
class IdentificacaoEvento {
    @prop({ required: true })
    public titulo!: string;

    @prop()
    public rotaPublica!: string;

    @prop({ required: true })
    public idEvento!: string;

    @prop()
    public endereco?: Endereco;

    @prop()
    public banner?: Buffer;

    @prop({ required: true })
    public instituicao?: IdentificacaoUsuario;

    public static gerarIdentificacao(evento: NonNullable<EventoQuery>,
        opcoes: { banner?: boolean, instituicao?: boolean } = { instituicao: true }) {
        const { banner, instituicao } = opcoes;
        return {
            titulo: evento.titulo,
            rotaPublica: evento._publicId + "/" + evento.slug,
            idEvento: evento._id,
            endereco: evento.endereco,
            instituicao: instituicao ? evento.criador : undefined,
            banner: banner ? evento.banner : undefined
        };
    }
}

export { IdentificacaoEvento };