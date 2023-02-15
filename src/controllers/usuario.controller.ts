import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";


/**
 * **Métodos utilizados apenas para testes**
 * 
 * para criar contas e afins, utilizar a controller e métodos respectivos
 * dos Models de Participante e Instituicao
 */
class UsuarioController {

    public static async getAll(req: Request, res: Response) {
        const allUsers = await UsuarioModel.find();
        res.json(allUsers);
    }
}

export default UsuarioController;