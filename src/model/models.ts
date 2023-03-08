import { getDiscriminatorModelForClass, getModelForClass } from "@typegoose/typegoose";

import { Avaliacao } from "./avaliacao.model";
import { Evento } from "./evento.model";
import { Inscricao } from "./inscricao.model";
import { Instituicao } from "./instituicao.model";
import { Operador } from "./operador.model";
import { Participante } from "./participante.model";
import { Periodo } from "./periodo.model";
import { UsuarioModel } from "./usuario.model";


// Resolve problemas de dependência circular recorrentes no Typegoose

export const InscricaoModel = getModelForClass(Inscricao);
export const EventoModel = getModelForClass(Evento);
export const ParticipanteModel = getDiscriminatorModelForClass(UsuarioModel, Participante);
export const OperadorModel = getDiscriminatorModelForClass(UsuarioModel, Operador);
export const InstituicaoModel = getDiscriminatorModelForClass(UsuarioModel, Instituicao);
export const AvaliacaoModel = getModelForClass(Avaliacao);
export const PeriodoModel = getModelForClass(Periodo);