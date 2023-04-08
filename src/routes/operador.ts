import express from "express";

import OperadorController from "../controllers/operador.controller";
import asyncWrapper from "../middlewares/asyncWrapper";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import { authInstituicao, authOperador } from "../middlewares/autorizacao.middleware";
import {
    validacaoAlternarOperador,
    validacaoAtivacaoOperador,
    validacaoCadastroOperador,
    validacaoTrocaSenhaOperador,
} from "../validation/operador.validation";
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
    .route("/cadastro")
    .post(validacao(validacaoCadastroOperador), OperadorController.cadastro);

router
    .route("/atualizar/:idOperador")
    .put(validacao(validacaoCadastroOperador), OperadorController.atualizarConta);

router
    .route("/alternar-estado")
    .post(validacao(validacaoAlternarOperador), OperadorController.alternarEstadoConta);

router
    .route("/excluir/:idOperador")
    .get(OperadorController.excluirConta);

router
    .route("/solicitar-troca-senha")
    .post(validacao(validacaoTrocaSenhaOperador), OperadorController.solicitarTrocaSenha);

router
    .route("/listar")
    .get(OperadorController.listarOperadores);

export default router;