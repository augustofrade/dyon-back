import { Request, Response } from "express";
import Email from "../util/Email";
// import EventoModel from "../model/evento.model";

class EventoController {

    public static async getAll(req: Request, res: Response): Promise<void> {
        // const todosEventos = EventoModel.find();
        res.json({ msg: "Sucesso" });
    }

    public static async get(req: Request, res: Response): Promise<void> {
        const email = new Email();
        const sucesso = await email.definir(
            {
                assunto: "Opewea é do Dyon",
                destinatario: "santos.andradepaula@gmail.com",
                remetente: email.REMETENTE,
                html: "<p>Oie</p>",
                texto: "texto"
            }
        ).enviar();
        res.send({ sucesso });
    }
}

export default EventoController;