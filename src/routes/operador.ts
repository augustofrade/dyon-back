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

router.use(authAcessToken);

router
    .route("/pagina-inicial")
    .get(asyncWrapper(authOperador), OperadorController.paginaInicial);


router.use(asyncWrapper(authInstituicao));

router
    .route("/listar")
    .get(OperadorController.listarOperadores);

router
    .route("/")
    .post(validacao(validacaoCadastroOperador), OperadorController.cadastro);

router
    .route("/:idOperador")
    .put(validacao(validacaoCadastroOperador), OperadorController.atualizarConta);

router
    .route("/:idOperador")
    .delete(OperadorController.excluirConta);

router
    .route("/:idOperador/solicitar-troca-senha")
    .post(OperadorController.solicitarTrocaSenha);

router
    .route("/:idOperador/alternar-estado")
    .post(OperadorController.alternarEstadoConta);


export default router;