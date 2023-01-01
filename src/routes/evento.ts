import express from "express";
import EventoController from "../controllers/evento.controller";

const router = express.Router();

// Listar todos eventos
router
    .route("/todos")
    .get((req, res) => EventoController.getAll(req, res));

router
    .route("/:id")
    .get((req, res) => EventoController.get(req, res));

export default router;