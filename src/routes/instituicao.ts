import express from "express";
import InstituicaoController from "../controllers/instituicao.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";
import authValidarRefreshToken from "../middlewares/authValidarRefreshToken";

const router = express.Router();

router
    .route("/cadastro")
    .post(authValidarRefreshToken, InstituicaoController.cadastro);

router.use(authAcessToken);

router
    .route("/perfil/:username")
    .get(InstituicaoController.obterDadosPerfil);

router
    .route("/atualizar/dados")
    .put(InstituicaoController.atualizarDados);

router
    .route("/atualizar/senha")
    .put(InstituicaoController.atualizarSenha);

router
    .route("/atualizar/privacidade")
    .put(InstituicaoController.atualizarPrivacidade);

router
    .route("/seguir/:username")
    .put(InstituicaoController.seguirInstituicao);

router
    .route("/endereco")
    .get(InstituicaoController.obterEndereco);

export default router;