import express from "express";
import multer from "multer";

import InstituicaoController from "../controllers/instituicao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { formatosImagemValidos } from "../types/enums";
import { authInstituicao, authParticipante } from "../middlewares/autorizacao.middleware";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("fotoPerfil");

router
    .route("/cadastro")
    .post(authValidarRefreshToken, InstituicaoController.cadastro);

router
    .route("/perfil/:username")
    .get(authOpcional, InstituicaoController.obterDadosPerfil);

router.use(authAcessToken);

router
    .route("/atualizar")
    .patch(asyncWrapper(authInstituicao), uploadFotoPerfil, InstituicaoController.atualizarDados);

router
    .route("/seguir/:username")
    .put(asyncWrapper(authParticipante), InstituicaoController.seguirInstituicao);

router
    .route("/endereco")
    .get(asyncWrapper(authInstituicao), InstituicaoController.obterEndereco);

export default router;