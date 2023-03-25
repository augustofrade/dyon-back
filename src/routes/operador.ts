import express from "express";
import OperadorController from "../controllers/operador.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { validacaoAlternarOperador, validacaoCadastroOperador, validacaoExcluirOperador } from "../validation/operador.validation";
import validacao from "../validation/validacao";

const router = express.Router();

router.use(authAcessToken);

router
    .route("/cadastro")
    .post(validacao(validacaoCadastroOperador), OperadorController.cadastro);

router
    .route("/estado")
    .post(validacao(validacaoAlternarOperador), OperadorController.alternarEstadoConta);

router
    .route("/excluir")
    .get(validacao(validacaoExcluirOperador), OperadorController.excluirConta);

export default router;