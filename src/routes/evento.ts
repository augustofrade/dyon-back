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

router.use(authAcessToken);

router
    .route("/novo")
    .post(EventoController.novoEvento);

router
    .route("/editar")
    .patch(EventoController.editarEvento);

router
    .route("/:id")
    .get(EventoController.dadosEvento);

export default router;