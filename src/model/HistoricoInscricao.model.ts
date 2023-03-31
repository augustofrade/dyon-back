import { getModelForClass, prop } from "@typegoose/typegoose";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";

class HistoricoInscricao {
    @prop({ required: true })
    public nomeEvento!: string;

    @prop({ required: true })
    public participante!: IdentificacaoUsuario;

    @prop({ required: true })
    public instituicao!: IdentificacaoUsuario;

    @prop({ default: new Date() })
    public dataParticipacao!: Date;
}

const HistoricoInscricaoModel = getModelForClass(HistoricoInscricao);

export { HistoricoInscricao, HistoricoInscricaoModel }