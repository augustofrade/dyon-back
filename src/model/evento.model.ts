import { DocumentType, pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { DateTime } from "luxon";

import { Endereco } from "../schema/endereco.schema";
import { Periodo } from "./periodo.model";
import gerarIdAleatorio from "../util/gerarIDAleatorio";
import gerarSlug from "../util/gerarSlug";
import { Categoria } from "./categoria.model";
import { Inscricao } from "./inscricao.model";
import { Instituicao } from "./instituicao.model";
import { PeriodoModel } from "./models";

@pre<Evento>("save", function() {
    this.slug = gerarSlug(this.titulo);
})
class Evento {
    @prop({ default: () => gerarIdAleatorio() })
    public _publicId!: string;

    @prop()
    public slug!: string;

    @prop({ required: true, ref: () => Instituicao })
    public criador!: Ref<Instituicao>;

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

    @prop({ required: true, ref: () => Periodo })
    public periodosOcorrencia!: Ref<Periodo>[];

    @prop({ default: false })
    public cancelado!: boolean;

    @prop()
    public banner!: Buffer;

    @prop({ default: true })
    public visivel!: boolean;

    @prop({ required: true, type: [Categoria] })
    public categorias!: Types.Array<Categoria>;

    @prop({ default: [], ref:() => Inscricao })
    public inscricoes!: Ref<Inscricao>[];

    public static todosDadosPorId(this: ReturnModelType<typeof Evento>, id: string) {
        return this.findById(id)
            .select("-__v")
            .populate("criador", "nomeFantasia username")
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
}

export { Evento };