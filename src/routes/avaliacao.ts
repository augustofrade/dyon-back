import express from "express";

import AvaliacaoController from "../controllers/avaliacao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authParticipante } from "../middlewares/autorizacao.middleware";

const router = express.Router();

router
    .route("/nova")
    .post(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.novaAvaliacao);

router
    .route("/editar/:idAvaliacao")
    .put(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.editarAvaliacao);

router
    .route("/excluir/:idAvaliacao")
    .delete(authAcessToken, asyncWrapper(authParticipante), AvaliacaoController.excluirAvaliacao);

router
    .route("/listar/:idUsuario")
    .get(AvaliacaoController.listarAvaliacoes);

export default router;