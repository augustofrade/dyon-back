import { ICategoria } from "./../types/interface";
import { Request, Response } from "express";
import { CategoriaModel } from "../model/categoria.model";


class CategoriaController {

    public static async getAll(req: Request, res: Response) {
        const categorias = await CategoriaModel.find().select("-__v");
        const categoriasVM: ICategoria[] = categorias.map(c => <ICategoria>{ slug: c._id, titulo: c.titulo });

        res.json(categoriasVM);
    }
}

export default CategoriaController;