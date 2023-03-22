import express from "express";
import AuthController from "../controllers/auth.controller";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import validacao from "../validation/validacao";
import { validacaoLogin, validacaoAccessToken } from "../validation/auth.validation";

const router = express.Router();

// Realizar login - Gerar Access Token e Refresh Token
router
    .route("/login")
    .post(authValidarRefreshToken, validacao(validacaoLogin), AuthController.login);

// Realizar logout - Remove o Refresh Token dos cookies do usuário e de seu documento
router
    .route("/logout")
    .post(AuthController.logout);

// Access Token - Gera um novo Access Token para que o usuário possa acessar rotas que necessitam de um
router
    .route("/token")
    .get(validacao(validacaoAccessToken), AuthController.gerarNovoAccessToken);

export default router;