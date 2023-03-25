import express from "express";
import SenhaController from "../controllers/senha.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { validacaoAtualizarSenha, validacaoRecuperacaoSenha, validacaoTokenSenha } from "../validation/senha.validation";
import validacao from "../validation/validacao";

const router = express.Router();

// Alterar a senha nas configurações de perfil
router
    .route("/alterar")
    .put(authAcessToken, validacao(validacaoAtualizarSenha), SenhaController.atualizarSenha);

// Enviar email de alteração de senha
router
    .route("/enviar-email")
    .get(validacao(validacaoTokenSenha), SenhaController.gerarTokenSenha);

// Alterar senha na página de recuperação de senha
router
    .route("/recuperar")
    .patch(validacao(validacaoRecuperacaoSenha), SenhaController.recuperarSenha);

export default router;