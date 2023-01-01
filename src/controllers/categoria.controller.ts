import { Request, Response } from "express";
import CategoriaModel from "../model/categoria.model";


class CategoriaController {

    public static async getAll(req: Request, res: Response): Promise<void> {
        const categorias = await CategoriaModel.findAndConvertBase64();
        res.json(categorias);
    }
}

export default CategoriaController;