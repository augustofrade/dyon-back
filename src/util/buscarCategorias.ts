import { CategoriaModel } from "../model/categoria.model";

export const buscarCategorias = (slugs: string[]) => {
    return CategoriaModel.find({ _id: slugs });
};