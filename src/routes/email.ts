import express from "express";
import EmailController from "../controllers/email.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { validacaoConfirmarEmail } from "../validation/email.validation";
import validacao from "../validation/validacao";

const router = express.Router();

router
    .route("/novo-token")
    .get(authAcessToken, validacao(validacaoConfirmarEmail), EmailController.novoToken);

router
    .route("/confirmar")
    .post(authAcessToken, EmailController.confirmarEmail);

export default router;