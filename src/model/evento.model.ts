import { Types } from "mongoose";
import { prop, pre, Ref, getModelForClass } from "@typegoose/typegoose";

import { Endereco } from "../schema/endereco.schema";
import { Categoria } from "./categoria.model";
import { Instituicao } from "./instituicao.model";
import { Avaliacao } from "../schema/avaliacao.schema";
import { Periodo } from "../schema/periodo.schema";
import { Inscricao } from "./inscricao.model";
import gerarIdAleatorio from "../util/gerarIDAleatorio";
import gerarSlug from "../util/gerarSlug";

@pre<Evento>("save", function() {
    this.slug = gerarSlug(this.titulo);
})
class Evento {
    @prop({ default: () => gerarIdAleatorio() })
    public _publicId!: string;

    @prop({ required: true })
    public slug!: string;

    @prop({ required: true, ref: () => Instituicao })
    public criador!: Ref<Instituicao>;

    @prop({ required: true })
    public titulo!: string;

    @prop({ required: true })
    public descricao!: string;

    @prop({ required: true })
    public localidade!: Endereco;

    @prop({ required: true })
    public inscricoesInicio!: Date;

    @prop({ required: true })
    public inscricoesTermino!: Date;

    @prop({ default: true })
    public inscricoesAbertas!: boolean;

    @prop({ required: true, type: [Periodo] })
    public periodosOcorrencia!: Types.Array<Periodo>;

    @prop({ required: true })
    public banner!: Buffer;

    @prop({ required: true, ref: () => Categoria })
    public categorias!: Ref<Categoria>[];

    @prop({ default: [], type: [Avaliacao] })
    public avaliacoes!: Types.Array<Avaliacao>;

    @prop({ default: [], type: [Inscricao] })
    public inscricoes!: Types.Array<Inscricao>;
}

const Eventomodel = getModelForClass(Evento);

export { Eventomodel, Evento };