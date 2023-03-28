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

    static async excluirConta(req: Request, res: Response) {
        try {
            await req.usuario!.remove();
            res.clearCookie("token");
            res.status(200).json({ msg: "Sua conta foi excluída com sucesso" });
        } catch(err) {
            res.status(400).json({ msg: "Ocorreu um erro ao tentar excluir sua conta, tente novamente", erro: true });
        }
    }

}

export default UsuarioController;