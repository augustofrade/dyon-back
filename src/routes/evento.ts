import express from "express";
import EventoController from "../controllers/evento.controller";

const router = express.Router();

// Listar todos eventos
router
    .route("/todos")
    .get(EventoController.getAll);

router
    .route("/:id")
    .get(EventoController.get);

export default router;