/* eslint-disable @typescript-eslint/no-empty-interface */
import { IInstituicao } from "./insituicao.model";
import { ICategoria } from "./categoria.model";
import mongoose, { Types } from "mongoose";
import EnderecoSchema, { IEndereco } from "../schema/endereco.schema";
import gerarIdAleatorio from "../util/gerarIDAleatorio";

export interface IEvento {
    _id: string;
    slug: string;
    criador: IInstituicao;
    titulo: string;
    descricao: string;
    localidade: IEndereco;
    inscricoesInicio: Date;
    inscricoesTermino: Date;
    banner: Buffer;
    categorias: ICategoria[];
    
}

export interface EventoModel extends mongoose.Model<IEvento> {
    
}

const EventoSchema = new mongoose.Schema<IEvento, EventoModel>(
    {
        _id: {
            type: String,
            default: () => gerarIdAleatorio()
        },
        slug: String,
        criador: {
            type: Types.ObjectId,
            ref: "Instituicao",
            required: true
        },
        titulo: {
            type: String,
            required: true
        },
        descricao: {
            type: String,
            required: true
        },
        localidade: {
            type: EnderecoSchema,
            required: true
        },
        inscricoesInicio: {
            type: Date,
            required: true
        },
        inscricoesTermino: {
            type: Date,
            required: true
        },
        banner: {
            type: Buffer,
            required: true
        },
        categorias: [{
            type: String,
            ref: "Categoria"
        }]
    }
);

const Evento = mongoose.model<IEvento, EventoModel>("Evento", EventoSchema);

export default Evento;