import express from "express";
import EventoController from "../controllers/evento.controller";

const router = express.Router();

// Listar todos eventos
router
    .route("/")
    .get((req, res) => EventoController.get(req, res));

export default router;