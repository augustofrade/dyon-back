import { Operador } from "../model/operador.model";
import { Documento } from "../types/types";
import { OperadorModel } from "../model/models";
import { Types } from "mongoose";

export const buscarIdOperadores = async (ids: string[]): Promise<string[]> => {
    const idsValidos = ids.filter(id => Types.ObjectId.isValid(id));
    const operadores = await OperadorModel.find({ _id: { $in: idsValidos } }).select("__id");
    return operadores.map((o: Documento<Operador>) => o._id);
};