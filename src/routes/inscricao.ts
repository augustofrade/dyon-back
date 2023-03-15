import express from "express";
import InscricaoController from "../controllers/inscricao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router
    .route("/novo")
    .post(authAcessToken, InscricaoController.novaInscricao);

router
    .route("/cancelar")
    .post(authAcessToken, InscricaoController.cancelarInscricao);

router
    .route("/confirmar/:id")
    .post(authAcessToken, InscricaoController.confirmarInscricao);

router
    .route("/por-periodo/:idPeriodo")
    .post(authAcessToken, InscricaoController.listarPorPeriodoEvento);
    

export default router;