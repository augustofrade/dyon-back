import express from "express";
import multer from "multer";

import EventoController from "../controllers/evento.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstitucional, authInstituicao, authParticipante, authUsuario } from "../middlewares/autorizacao.middleware";
import { formatosImagemValidos } from "../types/enums";
import { validacaoEdicaoEvento, validacaoNovoEvento } from "../validation/evento.validation";
import validacao from "../validation/validacao";

const router = express.Router();

const uploadBanner = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("banner");

router
    .route("/")
    .get(EventoController.pesquisa);

router
    .route("/todos")
    .get(EventoController.getAll);

router
    .route("/")
    .post(authAcessToken, asyncWrapper(authInstituicao), uploadBanner, validacao(validacaoNovoEvento), EventoController.novoEvento);

router
    .route("/:idPublico")
    .get(EventoController.dadosEvento);

router
    .route("/:idEvento")
    .put(authAcessToken, asyncWrapper(authInstituicao), uploadBanner, validacao(validacaoEdicaoEvento), EventoController.editarEvento);

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

router
    .route("/periodo/:idPeriodo/inscricoes")
    .get(authAcessToken, asyncWrapper(authUsuario), asyncWrapper(authInstitucional), EventoController.inscricoesNoPeriodo);

export default router;