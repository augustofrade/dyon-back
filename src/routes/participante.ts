import express from "express";
import ParticipanteController from "../controllers/participante.controller";

const router = express.Router();

// Cadastrar participante
router
    .route("/register")
    .post((req, res) => ParticipanteController.register(req, res));

router
    .route("/email")
    .post((req, res) => ParticipanteController.findByEmail(req, res));

router
    .route("/all")
    .get((req, res) => ParticipanteController.getAll(req, res));



export default router;