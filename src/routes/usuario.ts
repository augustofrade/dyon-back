import express from "express";

import UsuarioController from "../controllers/usuario.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authUsuario } from "../middlewares/autorizacao.middleware";

const router = express.Router();

router
    .route("/tipo")
    .get(authAcessToken, asyncWrapper(authUsuario), UsuarioController.tipoUsuario);

router
    .route("/dados-cabecalho")
    .get(authAcessToken, asyncWrapper(authUsuario), UsuarioController.dadosCabecalho);

router
    .route("/excluir-conta")
    .delete(authAcessToken, asyncWrapper(authUsuario), UsuarioController.excluirConta);

router
    .route("/:idUsuario/avaliacoes")
    .get(UsuarioController.listarAvaliacoes);


export default router;