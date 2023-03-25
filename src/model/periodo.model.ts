import { IPeriodo } from './../types/interface';
import { DocumentType, prop, ReturnModelType, Ref } from "@typegoose/typegoose";
import { InscricaoModel } from './models';
import { Evento } from './evento.model';

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
            inicio: p.inicio,
            termino: p.termino,
            isnscricoesMaximo: p.inscricoesMaximo && p.inscricoesMaximo > 0 ? p.inscricoesMaximo : undefined
        })));
    }

    public static async atualizar(this: ReturnModelType<typeof Periodo>, periodos: IPeriodo[], idEvento: string): Promise<string[]> {
        // TODO: refatorar
        const ids: string[] = [];
        periodos.forEach(async (p: IPeriodo) => {
            const dadosPeriodo: Omit<IPeriodo, "_id" | "inscricoes"> = {
                evento: idEvento,
                inicio: p.inicio,
                termino: p.termino,
                inscricoesMaximo: p.inscricoesMaximo && p.inscricoesMaximo > 0 ? p.inscricoesMaximo : undefined
            };
            
            if(p._id) {
                ids.push(p._id);
                await this.findByIdAndUpdate(p._id, { $set: dadosPeriodo });
            } else {
                const novoPeriodo = await this.create(dadosPeriodo);
                ids.push(novoPeriodo._id);
            }
        });

        return ids;
    }

    public async limiteInscricoesAtingido(this: DocumentType<Periodo>): Promise<boolean> {
        if(!this.inscricoesMaximo)
            return false;

        const numeroInscricoes = await InscricaoModel.find({ "periodo._id": this._id }).count();
        return numeroInscricoes >= this.inscricoesMaximo;
    }
}

export { Periodo };