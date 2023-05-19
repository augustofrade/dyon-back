import { Request, Response } from "express";
import { UsuarioModel } from "../model/usuario.model";
import { usuariosEnum } from "../types/enums";
import { Instituicao } from "../model/instituicao.model";
import { Avaliacao } from "../model/avaliacao.model";
import { AvaliacaoModel } from "../model/models";


class UsuarioController {

    public static async tipoUsuario(req: Request, res: Response) {
        res.json({ dados: req.usuario!.tipo });
    }
    
    public static async dadosCabecalho(req: Request, res: Response) {
        try {
            const usuario = await UsuarioModel.findById(req.userId);
            if(!usuario)
                throw new Error();
            res.json({ dados: await usuario.dadosCabecalho() });
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

    public static async listarAvaliacoes(req: Request, res: Response) {
        try {
            const { idUsuario } = req.params;
            const usuario = await UsuarioModel.findById(idUsuario);
            if(!usuario)
                return res.json({ msg: "Usuário não encontrado", erro: true });

            if(usuario.tipo === usuariosEnum.Instituicao) {
                await usuario.populate("avaliacoes");
                const avaliacoes = (usuario as unknown as Instituicao).avaliacoes as Avaliacao[];
                return res.status(200).json({ dados: avaliacoes });

            } else if(usuario.tipo === usuariosEnum.Participante) {
                const avaliacoes = await AvaliacaoModel.find({ "autor.idUsuario": idUsuario });
                return res.status(200).json({ dados: avaliacoes });
            } else {
                return res.json({ msg: "Este tipo de usuário não possui avaliações", erro: true });
            }
        } catch (err) {
            return res.json({ msg: "Não foi possível buscar as avaliações deste usuário, tente novamente", erro: true });
        }
    }

}

export default UsuarioController;