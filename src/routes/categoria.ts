import express from "express";
import CategoriaController from "../controllers/categoria.controller";

const router = express.Router();

// Listar todas categorias
router
    .route("/")
    .get(CategoriaController.getAll);

export default router;