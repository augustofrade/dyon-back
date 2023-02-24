import express from "express";
import EventoController from "../controllers/evento.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();

router.use(authAcessToken);

router
    .route("/novo")
    .post(EventoController.novoEvento);

router
    .route("/editar")
    .patch(EventoController.editarEvento);

router
    .route("/todos")
    .get(EventoController.getAll);

router
    .route("/:id")
    .get(EventoController.dadosEvento);

export default router;