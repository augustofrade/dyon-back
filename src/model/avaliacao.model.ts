import { modelOptions, prop, ReturnModelType } from "@typegoose/typegoose";

import { IdentificacaoEvento } from "../schema/identificacaoEvento.schema";
import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import { IAvaliacao } from "../types/interface";
import { ParticipanteQuery } from "./../types/types";
import { InstituicaoModel } from "./models";

@modelOptions({ schemaOptions: { timestamps: true } })
class Avaliacao {
    @prop({ required: true })
    public autor!: IdentificacaoUsuario;

    @prop({ required: true, min: 0, max: 10 })
    public nota!: number;

    @prop()
    public comentario?: string;

    @prop()
    public evento!: IdentificacaoEvento;

    public static buscarAvaliacaoEvento(this: ReturnModelType<typeof Avaliacao>, idUsuario: string, idEvento: string) {
        return this.findOne({
            "autor.idUsuario": idUsuario,
            "evento.idEvento": idEvento
        });
    }

    public static async novaAvaliacao(this: ReturnModelType<typeof Avaliacao>, usuario: ParticipanteQuery, dados: IAvaliacao) {
        const avaliacao = await this.create({
            autor: IdentificacaoUsuario.gerarIdentificacao(usuario),
            nota: dados.nota,
            comentario: dados.comentario,
            evento: IdentificacaoEvento.gerarIdentificacao(dados.evento, false, false)
        });
        
        const instituicao = await InstituicaoModel.findById(dados.evento.criador.idUsuario);
        await instituicao!.adicionarAvaliacao(avaliacao._id);

        return avaliacao;
    }

    public static editarAvaliacao(this: ReturnModelType<typeof Avaliacao>,
        idAvaliacao: string, dados: Pick<IAvaliacao, "nota" | "comentario">) {
        return this.findByIdAndUpdate(idAvaliacao, {
            nota: dados.nota,
            comentario: dados.comentario,
        });
    }

    public static async excluirAvaliacao(this: ReturnModelType<typeof Avaliacao>, idAvaliacao: string) {
        const removida  = await InstituicaoModel.findOneAndUpdate({ "avaliacoes": idAvaliacao }, {
            $pull: { "avaliacoes": idAvaliacao }
        })
        const excluida = await this.findByIdAndDelete(idAvaliacao);
        return removida || excluida;
    }

    public static removerIdentificacaoAutor(this: ReturnModelType<typeof Avaliacao>, idParticipante: string) {
        return this.updateMany({ "autor.idUsuario": idParticipante }, {
            "autor": {
                "nome": "Conta Excluída",
                "username": undefined,
                "idUsuario": undefined
            }
        });
    }

    public static removerIdentificacaoInstituicao(this: ReturnModelType<typeof Avaliacao>, idInstituicao: string) {
        return this.updateMany({ "evento.instituicao.idUsuario": idInstituicao }, {
            "evento.instituicao": {
                "nome": "Conta Excluída",
                "username": undefined,
                "idUsuario": undefined
            }
        });
    }
    
}

export { Avaliacao };