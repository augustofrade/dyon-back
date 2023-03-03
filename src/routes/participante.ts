import express from "express";
import multer from "multer";

import ParticipanteController from "../controllers/participante.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authOpcional from "../middlewares/authOpcional.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";
import { formatosImagemValidos } from "./../types/enums";

const router = express.Router();

const uploadFotoPerfil = multer({ fileFilter(req, file, cb) {
    cb(null, file.mimetype in formatosImagemValidos);
}, }).single("fotoPerfil");

router
    .route("/cadastro")
    .post(authValidarRefreshToken, ParticipanteController.cadastro);

router
    .route("/perfil/:username")
    .get(ParticipanteController.obterDadosPerfil);

router
    .route("/all")
    .get(ParticipanteController.getAll);

router.use(authAcessToken);

router
    .route("/atualizar/perfil")
    .put(uploadFotoPerfil, ParticipanteController.atualizarPerfil);

router
    .route("/atualizar/dados")
    .put(ParticipanteController.atualizarDados);

router
    .route("/atualizar/privacidade")
    .put(ParticipanteController.atualizarPrivacidade);


export default router;