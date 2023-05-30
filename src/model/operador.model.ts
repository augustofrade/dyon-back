import { DocumentType, pre, prop } from "@typegoose/typegoose";

import { IdentificacaoUsuario } from "../schema/identificacaoUsuario.schema";
import gerarUsername from "../util/gerarUsername";
import { Usuario } from "./usuario.model";

@pre<Operador>("save", function() {
    if(this.isModified("nomeCompleto")) {
        this.username = gerarUsername(this.nomeCompleto);
    }
})
class Operador extends Usuario {
    @prop({ required: true, minlength: 10, maxLength: 50 })
    public nomeCompleto!: string;

    @prop({ required: true, minLength: 9, maxLength: 15 })
    public telefone!: string;

    @prop({ default: false })
    public confirmado!: boolean;

    @prop({ required: true, default: true })
    public ativo!: boolean;

    @prop({ required: true })
    public instituicao!: IdentificacaoUsuario;

    public ativarConta(this: DocumentType<Operador>, novaSenha: string) {
        this.senhaToken = undefined;
        this.senha = novaSenha;
        this.ativo = true;
        this.confirmado = true;
        this.emailConfirmado = true;
        return this.save();
    }
}

export { Operador };