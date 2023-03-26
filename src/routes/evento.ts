import { authParticipante } from "../middlewares/autorizacao.middleware";
import { authInstituicao } from "../middlewares/autorizacao.middleware";
import express from "express";
import EventoController from "../controllers/evento.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router
    .route("/pesquisa")
    .get(EventoController.pesquisa);

router
    .route("/todos")
    .get(EventoController.getAll);

router
    .route("/novo")
    .post(authAcessToken, asyncWrapper(authInstituicao), EventoController.novoEvento);

router
    .route("/editar")
    .patch(authAcessToken, asyncWrapper(authInstituicao), EventoController.editarEvento);

router
    .route("/excluir")
    .delete(authAcessToken, asyncWrapper(authInstituicao), EventoController.excluirEvento);

router
    .route("/cancelar")
    .delete(authAcessToken, asyncWrapper(authInstituicao), EventoController.cancelarEvento);

router
    .route("/acompanhar/:idEvento")
    .put(authAcessToken, asyncWrapper(authParticipante), EventoController.acompanharEvento);

router
    .route("/dados/:id")
    .get(EventoController.dadosEvento);

router
    .route("/periodos/:idEvento")
    .get(EventoController.listarPeriodos);

export default router;