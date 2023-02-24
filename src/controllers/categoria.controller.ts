import { Request, Response } from "express";
import { CategoriaModel } from "../model/categoria.model";


class CategoriaController {

    public static async getAll(req: Request, res: Response) {
        const categorias = await CategoriaModel.find();
        res.json(categorias);
    }
}

export default CategoriaController;