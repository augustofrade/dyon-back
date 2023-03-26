import express from "express";

import UsuarioController from "../controllers/usuario.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authUsuario } from "../middlewares/autorizacao.middleware";

const router = express.Router();

router
    .route("/tipo")
    .get(authAcessToken, asyncWrapper(authUsuario), UsuarioController.tipoUsuario);



export default router;