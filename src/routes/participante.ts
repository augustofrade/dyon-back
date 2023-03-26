import express from "express";
import multer from "multer";

import ParticipanteController from "../controllers/participante.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { authParticipante } from "../middlewares/autorizacao.middleware";
import { formatosImagemValidos } from "../types/enums";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("fotoPerfil");

router
    .route("/cadastro")
    .post(authValidarRefreshToken, ParticipanteController.cadastro);

router
    .route("/perfil/:username")
    .get(authOpcional, ParticipanteController.obterDadosPerfil);

router
    .route("/all")
    .get(ParticipanteController.getAll);

router.use(authAcessToken);

router
    .route("/atualizar")
    .patch(asyncWrapper(authParticipante), uploadFotoPerfil, ParticipanteController.atualizarDados);


export default router;