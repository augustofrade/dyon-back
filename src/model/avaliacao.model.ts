import { modelOptions, prop } from "@typegoose/typegoose";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";

@modelOptions({ schemaOptions: { timestamps: true } })
class Avaliacao {
    @prop({ required: true })
    public autor!: IdentificacaoUsuario;

    @prop({ required: true, min: 0, max: 10 })
    public nota!: number;

    @prop()
    public comentario?: string;

    @prop()
    public nomeEvento!: string;

    @prop()
    public dataEvento!: Date;
}

export { Avaliacao };