import { DocumentType, prop, Ref, ReturnModelType } from "@typegoose/typegoose";

import { IPeriodo } from "./../types/interface";
import { Evento } from "./evento.model";
import { InscricaoModel } from "./models";

class Periodo {
    @prop({ required: true, ref: () => Evento })
    public evento!: Ref<Evento>;

    @prop({ required: true })
    public inicio!: Date;
    
    @prop({ required: true })
    public termino!: Date;

    @prop({ min: 1 })
    public inscricoesMaximo?: number;

    @prop({ default: false })
    public cancelado!: boolean;

    public static criarParaEvento(this: ReturnModelType<typeof Periodo>, periodos: IPeriodo[], idEvento: string) {
        return this.create(periodos.map((p: IPeriodo) => ({
            evento: idEvento,
            inicio: new Date(p.inicio),
            termino: new Date(p.termino),
            inscricoesMaximo: p.inscricoesMaximo && p.inscricoesMaximo > 0 ? p.inscricoesMaximo : undefined
        })));
    }

    public static async atualizarPeriodos(this: ReturnModelType<typeof Periodo>, periodos: IPeriodo[]): Promise<string[]> {
        const idsPeriodos: string[] = [];
        for(const p of periodos) {
            const periodo = await this.findByIdAndUpdate(p.id, { $set: {
                inicio: p.inicio ? new Date(p.inicio) : undefined,
                termino: p.termino ? new Date(p.termino) : undefined,
                inscricoesMaximo: p.inscricoesMaximo && p.inscricoesMaximo > 0 ? p.inscricoesMaximo : undefined
            } });
            if(periodo)
                idsPeriodos.push(periodo._id)
        }
        return idsPeriodos;
    }

    public async limiteInscricoesAtingido(this: DocumentType<Periodo>): Promise<boolean> {
        if(!this.inscricoesMaximo)
            return false;

        const numeroInscricoes = await InscricaoModel.count({ "periodo._id": this._id });
        return numeroInscricoes >= this.inscricoesMaximo;
    }

    public async cancelar(this: DocumentType<Periodo>) {
        this.cancelado = true;
        return this.save();
    }
}

export { Periodo };