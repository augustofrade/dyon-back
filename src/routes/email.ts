import express from "express";
import EmailController from "../controllers/email.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

// Realizar login - Gerar Access Token e Refresh Token
router
    .route("/novo-token")
    .get(authAcessToken, EmailController.novoToken);

router
    .route("/confirmar")
    .post(authAcessToken, EmailController.confirmarEmail);

export default router;