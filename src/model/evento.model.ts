import { prop, pre, Ref, getModelForClass } from "@typegoose/typegoose";

import { Endereco } from "../schema/endereco.schema";
import { Categoria } from "./categoria.model";
import { Instituicao } from "./instituicao.model";
import gerarIdAleatorio from "../util/gerarIDAleatorio";
import gerarSlug from "../util/gerarSlug";

@pre<Evento>("save", function() {
    this.slug = gerarSlug(this.titulo);
})
class Evento {
    @prop({ default: () => gerarIdAleatorio() })
    public _id!: string;

    @prop({ required: true })
    public slug!: string;

    @prop({ required: true, type: () => Instituicao })
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

    @prop({ required: true })
    public banner!: Buffer;

    @prop({ required: true, type: () => String })
    public categorias!: Ref<Categoria, string>[];    
}

const Eventomodel = getModelForClass(Evento);

export { Eventomodel, Evento };