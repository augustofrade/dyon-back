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
    .route("/")
    .post(authAcessToken, asyncWrapper(authInstituicao), EventoController.novoEvento);

router
    .route("/:idPublico")
    .get(EventoController.dadosEvento);

router
    .route("/:idEvento")
    .put(authAcessToken, asyncWrapper(authInstituicao), EventoController.editarEvento);

router
    .route("/:idEvento")
    .delete(authAcessToken, asyncWrapper(authInstituicao), EventoController.excluirEvento);

router
    .route("/:idEvento/cancelar")
    .delete(authAcessToken, asyncWrapper(authInstituicao), EventoController.cancelarEvento);

router
    .route("/:idEvento/acompanhar")
    .put(authAcessToken, asyncWrapper(authParticipante), EventoController.acompanharEvento);

router
    .route("/:idEvento/periodos")
    .get(EventoController.listarPeriodos);

export default router;