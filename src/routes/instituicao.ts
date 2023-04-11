import express from "express";
import multer from "multer";

import InstituicaoController from "../controllers/instituicao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { authInstituicao, authParticipante } from "../middlewares/autorizacao.middleware";
import { formatosImagemValidos } from "../types/enums";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("fotoPerfil");

router
    .route("/cadastro")
    .post(authValidarRefreshToken, InstituicaoController.cadastro);

router
    .route("/atualizar")
    .patch(authAcessToken, asyncWrapper(authInstituicao), uploadFotoPerfil, InstituicaoController.atualizarDados);

router
    .route("/endereco")
    .get(authAcessToken, asyncWrapper(authInstituicao), InstituicaoController.obterEndereco);

router
    .route("/:username/perfil")
    .get(authOpcional, InstituicaoController.obterDadosPerfil);

router
    .route("/:username/seguir")
    .post(authAcessToken, asyncWrapper(authParticipante), InstituicaoController.seguirInstituicao);

export default router;