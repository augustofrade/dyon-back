import express from "express";

import InscricaoController from "../controllers/inscricao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstitucional, authOperador, authParticipante, authUsuario } from "../middlewares/autorizacao.middleware";
import validacao from "../validation/validacao";
import {
    validacaoCancelarInscricao,
    validacaoConfirmarInscricao,
    validacaoNovaInscricao,
} from "./../validation/inscricao.validation";

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

router
    .route("/detalhes/:idInscricao")
    .get(authAcessToken, asyncWrapper(authParticipante), InscricaoController.detalhesInscricao);

router
    .route("/por-periodo/:idPeriodo")
    .get(authAcessToken, asyncWrapper(authUsuario), asyncWrapper(authInstitucional), InscricaoController.listarPorPeriodoEvento);

export default router;