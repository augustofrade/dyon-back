import { pre, prop, Ref } from "@typegoose/typegoose";
import { Types } from "mongoose";

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

    @prop({ required: true })
    public slug!: string;

    @prop({ required: true, ref: () => Instituicao })
    public criador!: Ref<Instituicao>;

    @prop({ required: true, minlength: 10, maxLength: 50 })
    public titulo!: string;

    @prop({ required: true, minLength: 20 })
    public descricao!: string;

    @prop({ required: true })
    public localidade!: Endereco;

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

    @prop({ required: true })
    public banner!: Buffer;

    @prop({ required: true, ref: () => Categoria })
    public categorias!: Ref<Categoria>[];

    @prop({ default: [], type: [Avaliacao] })
    public avaliacoes!: Types.Array<Avaliacao>;

    @prop({ default: [], type: [Inscricao] })
    public inscricoes!: Types.Array<Inscricao>;
}

export { Evento };