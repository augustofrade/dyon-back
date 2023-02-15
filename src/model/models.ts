import { getDiscriminatorModelForClass, getModelForClass } from "@typegoose/typegoose";

import { Evento } from "./evento.model";
import { Inscricao } from "./inscricao.model";
import { Instituicao } from "./instituicao.model";
import { Operador } from "./operador.model";
import { Participante } from "./participante.model";
import { UsuarioModel } from "./usuario.model";


// Resolve problemas de dependência circular recorrentes no Typegoose

export const InscricaoModel = getModelForClass(Inscricao);
export const Eventomodel = getModelForClass(Evento);
export const ParticipanteModel = getDiscriminatorModelForClass(UsuarioModel, Participante);
export const OperadorModel = getDiscriminatorModelForClass(UsuarioModel, Operador);
export const InstituicaoModel = getDiscriminatorModelForClass(UsuarioModel, Instituicao);