import express from "express";
import multer from "multer";

import InstituicaoController from "../controllers/instituicao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { formatosImagemValidos } from "../types/enums";

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
    .route("/atualizar/dados")
    .patch(InstituicaoController.atualizarDados);

router
    .route("/seguir/:username")
    .put(InstituicaoController.seguirInstituicao);

router
    .route("/endereco")
    .get(InstituicaoController.obterEndereco);

export default router;