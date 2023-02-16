import { prop, Ref } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { PerfilConfig } from "../schema/perfilConfig.schema";
import { Categoria } from "./categoria.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";

class Instituicao extends Usuario {
    @prop({ required: true, minlength: 3, maxLength: 40 })
    public nomeFantasia!: string;

    @prop({ required: true, minLength: 3, maxLength: 60 })
    public razaoSocial!: string;

    @prop({ required: true, maxLength: 80 })
    public nomeRepresentante!: string;

    @prop({ required: true,  })
    public cnpj!: string;

    @prop({ default: {} })
    public configuracoes!: PerfilConfig;

    @prop({ required: true, minlength: 18, maxlength: 18 })
    public telefone!: string;

    @prop({ required: true, default: [], ref: () => Categoria })
    public categoriasRamo!: Ref<Categoria>[];

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], ref: () => Operador })
    public operadores!: Ref<Operador>[];
}


export { Instituicao };