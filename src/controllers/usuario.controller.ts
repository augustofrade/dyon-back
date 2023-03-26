import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";


class UsuarioController {

    public static async tipoUsuario(req: Request, res: Response) {
        res.json({ dados: req.usuario!.tipo });
    }
    
    public static async dadosCabecalho(req: Request, res: Response) {
        try {
            const usuario = await UsuarioModel.findById(req.userId);
            if(!usuario)
                throw new Error();
            res.json({ data: usuario.dadosCabecalho() });
        } catch (err) {
            res.json({ msg: "Não foi possível exibir seus dados", erro: true });
        }
    }
}

export default UsuarioController;