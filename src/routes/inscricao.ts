import express from "express";

import InscricaoController from "../controllers/inscricao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authOperador, authParticipante } from "../middlewares/autorizacao.middleware";
import validacao from "../validation/validacao";
import { validacaoConfirmacaoInscricao, validacaoNovaInscricao } from "./../validation/inscricao.validation";

const router = express.Router();

router
    .route("/")
    .post(authAcessToken, asyncWrapper(authParticipante), validacao(validacaoNovaInscricao), InscricaoController.novaInscricao);

router
    .route("/:idInscricao/cancelar")
    .delete(authAcessToken, asyncWrapper(authParticipante),  InscricaoController.cancelarInscricao);

router
    .route("/:idInscricao/confirmar")
    .post(authAcessToken, asyncWrapper(authOperador), validacao(validacaoConfirmacaoInscricao), InscricaoController.confirmarInscricao);

router
    .route("/:idInscricao")
    .get(authAcessToken, asyncWrapper(authParticipante), InscricaoController.detalhesInscricao);

export default router;