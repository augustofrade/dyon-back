import express from "express";

import OperadorController from "../controllers/operador.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstituicao, authOperador } from "../middlewares/autorizacao.middleware";
import { validacaoAtivacaoOperador, validacaoCadastroOperador } from "../validation/operador.validation";
import validacao from "../validation/validacao";


const router = express.Router();

router
    .route("/ativacao")
    .post(validacao(validacaoAtivacaoOperador), OperadorController.ativacaoUnica);

router
    .route("/pagina-inicial")
    .get(authAcessToken, asyncWrapper(authOperador), OperadorController.paginaInicial);

router
    .route("/listar")
    .get(authAcessToken, OperadorController.listarOperadores);

router
    .route("/")
    .post(authAcessToken, validacao(validacaoCadastroOperador), asyncWrapper(authInstituicao), OperadorController.cadastro);

router
    .route("/:idOperador")
    .put(authAcessToken, validacao(validacaoCadastroOperador), asyncWrapper(authInstituicao), OperadorController.atualizarConta);

router
    .route("/:idOperador")
    .delete(authAcessToken, asyncWrapper(authInstituicao), OperadorController.excluirConta);

router
    .route("/:idOperador/solicitar-troca-senha")
    .post(authAcessToken, asyncWrapper(authInstituicao), OperadorController.solicitarTrocaSenha);

router
    .route("/:idOperador/alternar-estado")
    .post(authAcessToken, asyncWrapper(authInstituicao), OperadorController.alternarEstadoConta);


export default router;