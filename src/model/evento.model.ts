import { DocumentType, pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { DateTime } from "luxon";
import { Types } from "mongoose";

import { Endereco } from "../schema/endereco.schema";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { ICardEvento } from "../types/interface";
import gerarIdAleatorio from "../util/gerarIDAleatorio";
import gerarSlug from "../util/gerarSlug";
import { Categoria } from "./categoria.model";
import { Inscricao } from "./inscricao.model";
import { PeriodoModel } from "./models";
import { Operador } from "./operador.model";
import { Periodo } from "./periodo.model";

@pre<Evento>("save", function() {
    this.slug = gerarSlug(this.titulo);
})
class Evento {
    @prop({ default: () => gerarIdAleatorio() })
    public _publicId!: string;

    @prop()
    public slug!: string;

    @prop({ required: true })
    public criador!: IdentificacaoUsuario;

    @prop({ required: true, minlength: 10, maxLength: 50 })
    public titulo!: string;

    @prop({ required: true, minLength: 20 })
    public descricao!: string;

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ required: true })
    public inscricoesInicio!: Date;

    @prop({ required: true })
    public inscricoesTermino!: Date;

    @prop({ default: true })
    public inscricoesAbertas!: boolean;

    @prop({ default: [], ref: () => Periodo })
    public periodosOcorrencia!: Ref<Periodo>[];

    @prop({ default: false })
    public cancelado!: boolean;

    @prop()
    public banner!: Buffer;

    @prop({ default: true })
    public visivel!: boolean;

    @prop({ required: true, type: [Categoria] })
    public categorias!: Types.Array<Categoria>;

    @prop({ default: [], ref: () => Inscricao })
    public inscricoes!: Ref<Inscricao>[];

    @prop({ default: [], ref: () => Operador })
    public operadores!: Ref<Operador>[];

    public static dadosPublicos(this: ReturnModelType<typeof Evento>, idPublico: string) {
        return this.findOne({ _publicId: idPublico })
            .select("-__v -operadores")
    }

    public static pesquisar(this: ReturnModelType<typeof Evento>, pesquisa: string, categoria?: string, estado?: string) {
        return this.find({
            $or: [
                { "titulo": new RegExp(pesquisa, "i") },
                { "endereco.cidade" : new RegExp(pesquisa, "i") },
            ],
            categorias: categoria ? categoria : {},
            estado: estado ? estado : {},
            cancelado: false
        });
    }

    public async cancelarEvento(this: DocumentType<Evento>) {
        this.cancelado = true;
        const eventoCancelado = await this.save();
        if(eventoCancelado) {   
            const periodosCancelados = await PeriodoModel.updateMany({
                _id: { $in: this.periodosOcorrencia }
            });
            return periodosCancelados;
        }
        return eventoCancelado;
    }

    public permiteAlteracoes(this: DocumentType<Evento>) {
        if(!this.populated("periodosOcorrencia"))
            return false;
        const dataInicial = (<Array<Periodo>>this.periodosOcorrencia)[0].inicio
        return DateTime.now().plus({ hours: 24 }) > DateTime.fromJSDate(dataInicial);
    }

    public static async gerarCardsPorPeriodo(this: ReturnModelType<typeof Evento>,
        query: Record<string, unknown>, exibirApenasOcorrendo = false): Promise<ICardEvento[]> {
        const resultado = await this.find(query).populate("periodosOcorrencia");
        const dataAtual = new Date();
        const cards: ICardEvento[] = []
        resultado.forEach(evento => {
            const periodosEvento = evento.periodosOcorrencia as Periodo[];
            periodosEvento.forEach((periodo: Periodo) => {
                const condicao = exibirApenasOcorrendo ? dataAtual >= periodo.inicio && dataAtual < periodo.termino : true;
                if(condicao) {
                    const card = {
                        id: evento._id,
                        titulo: evento.titulo,
                        banner: evento.banner ? evento.banner.toString("base64") : "",
                        criador: evento.criador,
                        periodo: {
                            inicio: periodo.inicio,
                            termino: periodo.termino
                        },
                        endereco: evento.endereco
                    };
                    cards.push(card);
                }
            });
        });
        return cards;
    }
}

export { Evento };