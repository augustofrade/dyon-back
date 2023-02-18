import express from "express";
import InstituicaoController from "../controllers/instituicao.controller";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";

const router = express.Router();

router
    .route("/login")
    .post(authValidarRefreshToken, InstituicaoController.cadastro);



export default router;