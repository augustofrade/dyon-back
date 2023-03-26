import express from "express";

import OperadorController from "../controllers/operador.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstituicao } from "../middlewares/autorizacao.middleware";
import {
    validacaoAlternarOperador,
    validacaoCadastroOperador,
    validacaoExcluirOperador,
} from "../validation/operador.validation";
import validacao from "../validation/validacao";

const router = express.Router();

router.use(authAcessToken);
router.use(asyncWrapper(authInstituicao));

router
    .route("/cadastro")
    .post(validacao(validacaoCadastroOperador), OperadorController.cadastro);

// TODO: método de edição de dados

router
    .route("/estado")
    .post(validacao(validacaoAlternarOperador), OperadorController.alternarEstadoConta);

router
    .route("/excluir")
    .get(validacao(validacaoExcluirOperador), OperadorController.excluirConta);

export default router;