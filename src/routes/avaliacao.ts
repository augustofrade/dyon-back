import express from "express";
import AvaliacaoController from "../controllers/avaliacao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authParticipante } from "../middlewares/autorizacao.middleware";
import asyncWrapper from "../middlewares/asyncWrapper";

const router = express.Router();

router
    .route("/nova")
    .post(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.novaAvaliacao);

router
    .route("/editar/:idAvaliacao")
    .put(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.editarAvaliacao);

export default router;