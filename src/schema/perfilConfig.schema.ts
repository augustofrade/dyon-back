import { prop } from "@typegoose/typegoose";

class PerfilConfig {
    @prop({ default: true })
    public exibirInscricoes!: boolean;

    @prop({ default: true })
    public exibirCategorias!: boolean;

    @prop({ default: true })
    public exibirSeguindo!: boolean;

    @prop({ default: true })
    public exibirHistorico!: boolean;
}

export { PerfilConfig };