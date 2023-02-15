import { Request, Response } from "express";
import Email from "../email/Email";
import { ParticipanteModel } from "../model/models";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";


class ParticipanteController {

    public static async register(req: Request, res: Response) {
        try {            
            const { email, senha, nomeCompleto, cpf, endereco, dataNascimento } = req.body;
            // TODO: adicionar categoriasFavoritas quando já houver validação da rota
            const emailToken = gerarTokenGenerico();
            const usuarioCriado = await ParticipanteModel.create({
                email,
                senha,
                emailToken,
                nomeCompleto,
                cpf,
                endereco,
                dataNascimento
            });
            Email.Instance.enviarEmailDeCadastro(email, nomeCompleto, emailToken);
            res.status(201).json(usuarioCriado);
        } catch (error) {
            res.status(400).json({ error: "Não foi possível criar o usuário" });
        }
    }

    public static async getAll(req: Request, res: Response) {
        const allUsers = await ParticipanteModel.find();
        res.json(allUsers);
    }
}

export default ParticipanteController;