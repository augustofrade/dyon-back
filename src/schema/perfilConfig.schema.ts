import { prop } from "@typegoose/typegoose";

class PerfilConfig {
    // Participante
    @prop()
    public exibirInscricoes?: boolean;

    @prop()
    public exibirCategorias?: boolean;

    @prop()
    public exibirSeguindo?: boolean;

    @prop()
    public exibirHistorico?: boolean;

    // Instituicao
    @prop()
    public exibirEndereco?: boolean;
}

export { PerfilConfig };