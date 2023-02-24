import express from "express";
import AvaliacaoController from "../controllers/avaliacao.controller";

const router = express.Router();

router
    .route("/evento/:idEvento")
    .get(AvaliacaoController.avaliacoesEvento);

export default router;