import { InstituicaoModel, OperadorModel, ParticipanteModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";
import { IPeriodo } from "./interface"

export type Documento<T> = T & { _id: string, createdAt?: string }

export type IPeriodoSaida = Omit<IPeriodo, "evento">


const retornoUsuario = async () => await UsuarioModel.findById({});
const retornoParticipante = async () => await ParticipanteModel.findById({});
const retornoInstituicao = async () => await InstituicaoModel.findById({});
const retornoOperador = async () => await OperadorModel.findById({});

export type UsuarioQuery = Awaited<ReturnType<typeof retornoUsuario>>;
export type ParticipanteQuery = Awaited<ReturnType<typeof retornoParticipante>>;
export type InstituicaoQuery = Awaited<ReturnType<typeof retornoInstituicao>>;
export type OperadorQuery = Awaited<ReturnType<typeof retornoOperador>>;