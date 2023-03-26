import { authParticipante, authOperador } from "../middlewares/autorizacao.middleware";
import { validacaoNovaInscricao, validacaoCancelarInscricao, validacaoConfirmarInscricao } from "./../validation/inscricao.validation";
import express from "express";
import InscricaoController from "../controllers/inscricao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import validacao from "../validation/validacao";
import asyncWrapper from "../middlewares/asyncWrapper";

const router = express.Router();

router
    .route("/novo")
    .post(authAcessToken, asyncWrapper(authParticipante), validacao(validacaoNovaInscricao), InscricaoController.novaInscricao);

router
    .route("/cancelar")
    .post(authAcessToken, asyncWrapper(authParticipante), validacao(validacaoCancelarInscricao),  InscricaoController.cancelarInscricao);

router
    .route("/confirmar/:idInscricao")
    .post(authAcessToken, asyncWrapper(authOperador), validacao(validacaoConfirmarInscricao), InscricaoController.confirmarInscricao);

// TODO: adicionar validacao de instituicao ou operador
router
    .route("/por-periodo/:idPeriodo")
    .get(authAcessToken, InscricaoController.listarPorPeriodoEvento);

export default router;