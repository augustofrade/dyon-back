import express from "express";
import ParticipanteController from "../controllers/participante.controller";

const router = express.Router();

// Cadastrar participante
router
    .route("/cadastro")
    .post(ParticipanteController.cadastro);


router
    .route("/all")
    .get(ParticipanteController.getAll);



export default router;