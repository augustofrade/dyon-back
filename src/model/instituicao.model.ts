import { IInstituicaoConfig } from "../types/interface";
import { pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";

import { Endereco } from "../schema/endereco.schema";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import gerarUsername from "../util/gerarUsername";
import { Categoria } from "./categoria.model";
import { Evento } from "./evento.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";
import { Types } from "mongoose";


const configsPadrao = (): IInstituicaoConfig => ({ exibirEndereco: true });


@pre<Instituicao>("save", function() {
    if(this.isModified("nomeFantasia")) {
        this.username = gerarUsername(this.nomeFantasia);
    }
})
class Instituicao extends Usuario {
    @prop({ required: true, minlength: 3, maxLength: 40 })
    public nomeFantasia!: string;

    @prop({ required: true, maxLength: 80 })
    public nomeRepresentante!: string;

    @prop({ required: true,  })
    public cnpj!: string;

    @prop({ default: () => configsPadrao() })
    public configuracoes!: PerfilConfig;

    @prop({ required: true, minlength: 10, maxlength: 16 })
    public telefone!: string;

    @prop({ required: true, default: [], type: [Categoria] })
    public categoriasRamo!: Types.Array<Categoria>;

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], ref: () => Operador })
    public operadores!: Ref<Operador>[];

    @prop({ default: [], ref: () => Evento })
    public eventos!: Ref<Evento>[];

    static obterDadosPerfil(this: ReturnModelType<typeof Instituicao>, username: string) {
        // TODO: excluir infos do perfil de acordo com as configurações

        return this.findOne({ username }).select("-senha -username -cnpj -configuracoes -telefone -updateDate");
    }

    static obterEndereco(this: ReturnModelType<typeof Instituicao>, id: string) {
        return this.findById(id).select("endereco");
    }
}


export { Instituicao };