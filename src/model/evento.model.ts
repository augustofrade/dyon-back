import { DocumentType, pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";
import { Types } from "mongoose";
import { DateTime } from "luxon";

import { Avaliacao } from "../schema/avaliacao.schema";
import { Endereco } from "../schema/endereco.schema";
import { Periodo } from "../schema/periodo.schema";
import gerarIdAleatorio from "../util/gerarIDAleatorio";
import gerarSlug from "../util/gerarSlug";
import { Categoria } from "./categoria.model";
import { Inscricao } from "./inscricao.model";
import { Instituicao } from "./instituicao.model";

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

    @prop({ min: 1 })
    public inscricoesMaximo?: number;

    @prop({ required: true })
    public inscricoesInicio!: Date;

    @prop({ required: true })
    public inscricoesTermino!: Date;

    @prop({ default: true })
    public inscricoesAbertas!: boolean;

    @prop({ required: true, type: [Periodo] })
    public periodosOcorrencia!: Types.Array<Periodo>;

    @prop()
    public banner!: Buffer;

    @prop({ default: true })
    public visivel!: boolean;

    @prop({ required: true, type: [Categoria] })
    public categorias!: Types.Array<Categoria>;

    @prop({ default: [], type: [Avaliacao] })
    public avaliacoes!: Types.Array<Avaliacao>;

    @prop({ default: [], ref:() => Inscricao })
    public inscricoes!: Ref<Inscricao>[];

    public static async todosDadosPorId(this: ReturnModelType<typeof Evento>, id: string) {
        return this.findById(id)
            .populate("criador", "nomeFantasia username")
            .populate("avaliacoes", "nota");
    }

    public static async avaliacoesPorId(this: ReturnModelType<typeof Evento>, id: string) {
        return this.findById(id).select("avaliacoes").populate({
            path: "avaliacoes",
            populate: {
                path: "autor",
                select: "username nomeCompleto nomeSocial fotoPerfil"
            }
        });
    }

    public static async pesquisar(this: ReturnModelType<typeof Evento>, pesquisa: string, categoria?: string, estado?: string) {
        return this.find({
            $or: [
                { "titulo": new RegExp(pesquisa, "i") },
                { "endereco.cidade" : new RegExp(pesquisa, "i") },
            ],
            categorias: categoria ? categoria : {},
            estado: estado ? estado : {}
        });
    }

    public permiteAlteracoes(this: DocumentType<Evento>) {
        return DateTime.now().plus({ hours: 24 }) > DateTime.fromJSDate(this.periodosOcorrencia[0].inicio);
    }
}

export { Evento };