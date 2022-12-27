import express from "express";
import ParticipanteController from "../controllers/participante.controller";

const router = express.Router();

// Cadastrar participante
router
    .route("/participante")
    .post((req, res) => ParticipanteController.register(req, res));

router
    .route("/participante/email")
    .post((req, res) => ParticipanteController.findByEmail(req, res));

router
    .route("/participante/all")
    .get((req, res) => ParticipanteController.getAll(req, res));



export default router;