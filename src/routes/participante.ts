import express from "express";
import multer from "multer";

import ParticipanteController from "../controllers/participante.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { authParticipante } from "../middlewares/autorizacao.middleware";
import { formatosImagemValidos } from "../types/enums";
import { validacaoAtualizarParticipante, validacaoCadastroParticipante } from "../validation/participante.validation";
import validacao from "../validation/validacao";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
} }).single("fotoPerfil");

router
    .route("/")
    .get(ParticipanteController.getAll);

router
    .route("/cadastro")
    .post(authValidarRefreshToken, validacao(validacaoCadastroParticipante), ParticipanteController.cadastro);

router
    .route("/atualizar")
    .patch(authAcessToken, asyncWrapper(authParticipante), validacao(validacaoAtualizarParticipante), uploadFotoPerfil, ParticipanteController.atualizarDados);

router
    .route("/historico")
    .get(authAcessToken, asyncWrapper(authParticipante), ParticipanteController.historicoInscricoes);

router
    .route("/:username/perfil")
    .get(authOpcional, ParticipanteController.obterDadosPerfil);

export default router;