import express from "express";
import multer from "multer";

import InstituicaoController from "../controllers/instituicao.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { authInstituicao, authParticipante } from "../middlewares/autorizacao.middleware";
import { formatosImagemValidos } from "../types/enums";
import { validacaoAtualizarInstituicao, validacaoCadastroInstituicao } from "../validation/instituicao.validation";
import validacao from "../validation/validacao";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("fotoPerfil");

router
    .route("/cadastro")
    .post(authValidarRefreshToken, validacao(validacaoCadastroInstituicao), InstituicaoController.cadastro);

router
    .route("/atualizar")
    .patch(authAcessToken, asyncWrapper(authInstituicao), uploadFotoPerfil, validacao(validacaoAtualizarInstituicao), InstituicaoController.atualizarDados);

router
    .route("/endereco")
    .get(authAcessToken, asyncWrapper(authInstituicao), InstituicaoController.obterEndereco);

router
    .route("/")
    .get(InstituicaoController.listarInstituicoes);

router
    .route("/:username/perfil")
    .get(authOpcional, InstituicaoController.obterDadosPerfil);

router
    .route("/:username/seguir")
    .post(authAcessToken, asyncWrapper(authParticipante), InstituicaoController.seguirInstituicao);

export default router;