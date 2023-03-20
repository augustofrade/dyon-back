import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";


class UsuarioController {

    public static async tipoUsuario(req: Request, res: Response) {
        const usuario = await UsuarioModel.findById(req.userId);
        if(!usuario)
            return res.status(404).json({ msg: "Erro interno" });
        res.json({ dados: usuario.tipo });
    }
}

export default UsuarioController;