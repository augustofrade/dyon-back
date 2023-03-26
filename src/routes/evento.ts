import express from "express";
import EventoController from "../controllers/evento.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router
    .route("/pesquisa")
    .get(EventoController.pesquisa);

router
    .route("/todos")
    .get(EventoController.getAll);

router
    .route("/novo")
    .post(authAcessToken, EventoController.novoEvento);

router
    .route("/editar")
    .patch(authAcessToken, EventoController.editarEvento);

router
    .route("/excluir")
    .delete(authAcessToken, EventoController.excluirEvento);

router
    .route("/acompanhar/:idEvento")
    .put(authAcessToken, EventoController.acompanharEvento);

router
    .route("/dados/:id")
    .get(EventoController.dadosEvento);

router
    .route("/periodos/:idEvento")
    .get(EventoController.listarPeriodos);

export default router;