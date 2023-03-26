import { InstituicaoModel } from "./../model/models";
import { Request, Response } from "express";
import Email from "../email/Email";
import { OperadorModel } from "../model/models";
import { gerarTokenGenerico } from "../util/gerarTokenGenerico";

export default abstract class OperadorController {

    static async cadastro(req: Request, res: Response) {
        const { nomeCompleto, telefone, email } = req.body;
        try {
            const emailToken = gerarTokenGenerico();
            const novoOperador = new OperadorModel({
                nomeCompleto,
                telefone,
                email,
                ativo: true,
                instituicao: req.instituicao!._id,
                emailToken: { _id: emailToken.hash, expiracao: emailToken.expiracao }
            });
            await novoOperador.save();
            await InstituicaoModel.findByIdAndUpdate(req.userId, { $push: { operadores: novoOperador._id } });
            Email.Instance.enviarEmailOperador(email, novoOperador.nomeCompleto.split(" ")[0], req.instituicao!.nomeFantasia);
            res.status(200).json({ msg: "Cadastro realizado com sucesso" });
        } catch(erro) {
            res.status(400).json({ msg: "Falha ao realizar cadastro", erro });
        }
    }

    static async alternarEstadoConta(req: Request, res: Response) {
        try {
            const operador = await OperadorModel.findById(req.body.idOperador);
            if(!operador)
                return res.status(404).json({ msg: "Operador não encontrado", erro: true });
                
            if(!req.instituicao!.operadores.includes(req.body.idOperador))
                return res.json({ msg: "Não autorizado: este operador não pertence à sua instituição", erro: true });
            
            operador.ativo = !(operador.ativo);
            await operador.save();
            const nome = operador.nomeCompleto.split(" ")[0];
            const operacaoRealizada = operador.ativo ? "ativada" : "desativada";
            res.status(200).json({ msg: `A conta de ${nome} foi ${operacaoRealizada} com sucesso` });
        } catch (err) {
            res.status(400).json({ msg: "Ocorreu um erro ao tentar ativar/desativar a conta deste operador", erro: true });
        }
    }
    
    static async excluirConta(req: Request, res: Response) {
        try {
            if(!req.instituicao!.operadores.includes(req.body.idOperador))
                return res.json({ msg: "Não autorizado: este operador não pertence à sua instituição", erro: true });

            const deletada = await OperadorModel.findByIdAndDelete(req.body.idOperador);
            if(deletada) {
                req.instituicao!.operadores = req.instituicao!.operadores.filter(o => o._id !== req.body.idOperador);
                await req.instituicao!.save();
                res.status(200).json({ msg: "A conta deste operador foi excluída com sucesso " });
            }
            else
                throw new Error();
        } catch (err) {
            res.status(400).json({ msg: "Não foi possível excluir a conta deste operador, tente novamente.", erro: true });
        }
    }

    // TODO: método para visualização de eventos com períodos ocorrendo em tempo real 
}