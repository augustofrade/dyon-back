import express from "express";

import AvaliacaoController from "../controllers/avaliacao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authParticipante } from "../middlewares/autorizacao.middleware";

const router = express.Router();

router
    .route("/")
    .post(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.novaAvaliacao);

router
    .route("/:idAvaliacao")
    .put(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.editarAvaliacao);

router
    .route("/:idAvaliacao")
    .delete(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.excluirAvaliacao);

export default router;