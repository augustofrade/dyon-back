import { validacaoNovaInscricao, validacaoCancelarInscricao, validacaoConfirmarInscricao } from "./../validation/inscricao.validation";
import express from "express";
import InscricaoController from "../controllers/inscricao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import validacao from "../validation/validacao";

const router = express.Router();

router
    .route("/novo")
    .post(authAcessToken, validacao(validacaoNovaInscricao), InscricaoController.novaInscricao);

router
    .route("/cancelar")
    .post(authAcessToken, validacao(validacaoCancelarInscricao),  InscricaoController.cancelarInscricao);

router
    .route("/confirmar/:idInscricao")
    .post(authAcessToken, validacao(validacaoConfirmarInscricao), InscricaoController.confirmarInscricao);

router
    .route("/por-periodo/:idPeriodo")
    .get(authAcessToken, InscricaoController.listarPorPeriodoEvento);

export default router;