import { Request, Response } from "express";
import { ParticipanteModel } from "../model/participante.model";


class ParticipanteController {

    public static async register(req: Request, res: Response) {
        try {            
            const { username, email, senha, nomeCompleto, cpf, endereco } = req.body;
            
            const usuarioCriado = await ParticipanteModel.create({
                username,
                email,
                senha,
                nomeCompleto,
                cpf,
                endereco
            });
            
            res.status(201).json(usuarioCriado);
        } catch (error) {
            res.status(400).json({ error: "Não foi possível criar o usuário", msg: error });
        }
    }

    public static async getAll(req: Request, res: Response) {
        const allUsers = await ParticipanteModel.find();
        res.json(allUsers);
    }

    public static async findByEmail(req: Request, res: Response) {
        const user = await ParticipanteModel.findOne({ email: req.body.email }); // null caso nao encontrado
        res.json(user);
    }
}

export default ParticipanteController;