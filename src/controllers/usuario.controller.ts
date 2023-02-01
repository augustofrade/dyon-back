import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";


/**
 * **Métodos utilizados apenas para testes**
 * 
 * para criar contas e afins, utilizar a controller e métodos respectivos
 * dos Models de Participante e Instituicao
 */
class UsuarioController {

    public static async register(req: Request, res: Response) {
        try {            
            const { username, email, senha } = req.body;
            
            const usuarioCriado = await UsuarioModel.create({
                username,
                email,
                senha
            });
            
            res.status(201).json(usuarioCriado);
        } catch (error) {
            res.status(400).json({ error: "Não foi possível criar o usuário" });
        }
    }

    public static async getAll(req: Request, res: Response) {
        const allUsers = await UsuarioModel.find();
        res.json(allUsers);
    }

    public static async findByEmail(req: Request, res: Response) {
        const user = await UsuarioModel.findByEmail(req.body.email);
        res.json(user);
    }
}

export default UsuarioController;