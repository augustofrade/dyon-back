import { Request, Response } from "express";
import UserModel, { IUsuario } from "../model/usuario.model";


class UsuarioController {

    public static async register(req: Request, res: Response) {
        try {            
            const { username, email, senha } = req.body;
            
            const usuarioCriado: IUsuario = await UserModel.create({
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
        const allUsers = await UserModel.find();
        res.json(allUsers);
    }

    public static async findByEmail(req: Request, res: Response) {
        const user = await UserModel.findByEmail(req.body.email);
        res.json(user);
    }
}

export default UsuarioController;