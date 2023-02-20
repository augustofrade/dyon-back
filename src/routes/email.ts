import express from "express";
import EmailController from "../controllers/email.controller";

const router = express.Router();

// Realizar login - Gerar Access Token e Refresh Token
router
    .route("/novoToken")
    .get(EmailController.novoToken);

router
    .route("/confirmar")
    .post(EmailController.confirmarEmail);

export default router;