import { prop, Ref } from "@typegoose/typegoose";
import { Endereco } from "../schema/endereco.schema";
import { Categoria } from "./categoria.model";
import { Operador } from "./operador.model";
import { Usuario } from "./usuario.model";

class Instituicao extends Usuario {
    @prop({ required: true })
    public nomeFantasia!: string;

    @prop({ required: true })
    public razaoSocial!: string;

    @prop({ required: true })
    public nomeRepresentante!: string;

    @prop({ required: true })
    public cnpj!: string;

    @prop({ required: true })
    public telefone!: string;

    @prop({ required: true, default: [], ref: () => Categoria })
    public categoriasRamo!: Ref<Categoria>[];

    @prop({ required: true })
    public endereco!: Endereco;

    @prop({ default: [], ref: () => Operador })
    public operadores!: Ref<Operador>[];
}


export { Instituicao };