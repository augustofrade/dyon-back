import { IInstituicaoConfig } from "../types/interface";
import { pre, prop, Ref, ReturnModelType } from "@typegoose/typegoose";

import { Endereco } from "../schema/endereco.schema";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import gerarUsername from "../util/gerarUsername";
import { Categoria } from "./categoria.model";
import { Evento } from "./evento.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";


const configsPadrao = (): IInstituicaoConfig => ({ exibirEndereco: true });


@pre<Instituicao>("save", function() {
    if(this.isModified("nomeSocial" || this.isModified("nomeFantasia"))) {
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

    @prop({ required: true, minlength: 18, maxlength: 18 })
    public telefone!: string;

    @prop({ required: true, default: [], ref: () => Categoria })
    public categoriasRamo!: Ref<Categoria>[];

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