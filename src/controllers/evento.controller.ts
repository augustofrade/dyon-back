import { Request, Response } from "express";
import Email from "../util/Email";
// import EventoModel from "../model/evento.model";

class EventoController {

    public static async getAll(req: Request, res: Response): Promise<void> {
        // const todosEventos = EventoModel.find();
        res.json({ msg: "Sucesso" });
    }

    public static async get(req: Request, res: Response): Promise<void> {
        res.send({ sucesso: true });
    }
}

export default EventoController;