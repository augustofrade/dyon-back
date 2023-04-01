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

    
    public static async usuarioJaParticipou(this: ReturnModelType<typeof HistoricoInscricao>, 
        // TODO: alterar essa buscar e usar lookup com evento.instituicao.idUsuario
        idUsuario: string, idsEventos: string[]): Promise<boolean> {
        const quantia = await HistoricoInscricaoModel.count({
            "participante.idUsuario": idUsuario,
            "evento._id": idsEventos
        });
        return quantia > 0;
    }
}

const HistoricoInscricaoModel = getModelForClass(HistoricoInscricao);

export { HistoricoInscricao, HistoricoInscricaoModel }