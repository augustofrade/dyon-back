import { Periodo } from "../model/periodo.model";

export const eventoDentroPeriodo = (periodo: Periodo) => {
    const dataAtual = new Date();
    return dataAtual >= periodo.inicio && dataAtual <= periodo.termino;
};