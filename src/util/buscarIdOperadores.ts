import { Operador } from "../model/operador.model";
import { Documento } from "../types/types";
import { OperadorModel } from "../model/models";

export const buscarIdOperadores = async (ids: string[]): Promise<string[]> => {
    const operadores = await OperadorModel.find({ _id: ids }).select("__id");
    return operadores.map((o: Documento<Operador>) => o._id);
};