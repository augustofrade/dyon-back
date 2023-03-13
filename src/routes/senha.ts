import express from "express";
import SenhaController from "../controllers/senha.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

// Alterar a senha nas configurações de perfil
router
    .route("/alterar")
    .put(authAcessToken, SenhaController.atualizarSenha);

// Enviar email de alteração de senha
router
    .route("/token")
    .get(SenhaController.gerarTokenSenha);

// Alterar senha na página de recuperação de senha
router
    .route("/recuperar")
    .get(SenhaController.recuperarSenha);

export default router;