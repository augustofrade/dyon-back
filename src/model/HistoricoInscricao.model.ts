import { getModelForClass, prop, ReturnModelType } from "@typegoose/typegoose";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { IdentificacaoEvento } from "../schema/identificacaoEvento.schema";

class HistoricoInscricao {
    @prop({ required: true })
    public evento!: IdentificacaoEvento;

    @prop({ required: true })
    public participante!: IdentificacaoUsuario;

    @prop({ default: new Date() })
    public dataParticipacao!: Date;

    
    public static buscarInscricao(this: ReturnModelType<typeof HistoricoInscricao>, 
        idUsuario: string, idEvento: string) {

        return this.findOne({
            "participante.idUsuario": idUsuario,
            "evento._id": idEvento
        });
    }

    public static historicoParticipante(this: ReturnModelType<typeof HistoricoInscricao>, idParticipante: string) {
        return this.find({ "participante.idUsuario": idParticipante }).select("-_id -__v");
    }
}

const HistoricoInscricaoModel = getModelForClass(HistoricoInscricao);

export { HistoricoInscricao, HistoricoInscricaoModel }