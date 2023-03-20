import express from "express";
import UsuarioController from "../controllers/usuario.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router
    .route("/tipo")
    .get(authAcessToken, UsuarioController.tipoUsuario);



export default router;