import { Request, Response } from "express";


class EventoController {

    public static get(req: Request, res: Response): void {
        res.json({ msg: "Sucesso" });
    }
}

export default EventoController;