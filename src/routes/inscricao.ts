import express from "express";

import InscricaoController from "../controllers/inscricao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstitucional, authOperador, authParticipante, authUsuario } from "../middlewares/autorizacao.middleware";
import validacao from "../validation/validacao";
import { validacaoNovaInscricao } from "./../validation/inscricao.validation";

const router = express.Router();

router
    .route("/")
    .post(authAcessToken, asyncWrapper(authParticipante), validacao(validacaoNovaInscricao), InscricaoController.novaInscricao);

router
    .route("/:idInscricao/cancelar")
    .post(authAcessToken, asyncWrapper(authParticipante),  InscricaoController.cancelarInscricao);

router
    .route("/:idInscricao/confirmar")
    .post(authAcessToken, asyncWrapper(authOperador), InscricaoController.confirmarInscricao);

router
    .route("/:idInscricao")
    .get(authAcessToken, asyncWrapper(authParticipante), InscricaoController.detalhesInscricao);

// TODO: mudar para evento
router
    .route("/por-periodo/:idPeriodo")
    .get(authAcessToken, asyncWrapper(authUsuario), asyncWrapper(authInstitucional), InscricaoController.listarPorPeriodoEvento);

export default router;