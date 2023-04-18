import { EventoModel, InstituicaoModel, OperadorModel, ParticipanteModel } from "../model/models";
import { UsuarioModel } from "../model/usuario.model";

export type Documento<T> = T & { _id: string, createdAt?: string }

const retornoUsuario = async () => await UsuarioModel.findById({});
const retornoParticipante = async () => await ParticipanteModel.findById({});
const retornoInstituicao = async () => await InstituicaoModel.findById({});
const retornoOperador = async () => await OperadorModel.findById({});
const retornoEvento = async () => await EventoModel.findById({});

export type UsuarioQuery = Awaited<ReturnType<typeof retornoUsuario>>;
export type ParticipanteQuery = Awaited<ReturnType<typeof retornoParticipante>>;
export type InstituicaoQuery = Awaited<ReturnType<typeof retornoInstituicao>>;
export type OperadorQuery = Awaited<ReturnType<typeof retornoOperador>>;
export type EventoQuery = Awaited<ReturnType<typeof retornoEvento>>;