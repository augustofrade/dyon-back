import express from "express";
import ParticipanteController from "../controllers/participante.controller";

const router = express.Router();

// Cadastrar participante
router
    .route("/register")
    .post(ParticipanteController.register);


router
    .route("/all")
    .get(ParticipanteController.getAll);



export default router;