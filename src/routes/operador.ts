import express from "express";
import OperadorController from "../controllers/operador.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router.use(authAcessToken);

router
    .route("/cadastro")
    .post(OperadorController.cadastro);

router
    .route("/estado")
    .post(OperadorController.alternarEstadoConta);

router
    .route("/excluir")
    .get(OperadorController.excluirConta);

export default router;