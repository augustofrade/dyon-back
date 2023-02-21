import express from "express";
import AuthController from "../controllers/auth.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";

const router = express.Router();

// Realizar login - Gerar Access Token e Refresh Token
router
    .route("/login")
    .post(authValidarRefreshToken, AuthController.login);

// Realizar logout - Remove o Refresh Token dos cookies do usuário e de seu documento
router
    .route("/logout")
    .post(AuthController.logout);

// Access Token - Gera um novo Access Token para que o usuário possa acessar rotas que necessitam de um
router
    .route("/token")
    .get(AuthController.gerarNovoAccessToken);

// Alterar Senha - Altera a senha de qualquer tipo de usuário caso atenda os requisitos de senha
router
    .route("/alterar-senha")
    .put(authAcessToken, AuthController.atualizarSenha);

export default router;