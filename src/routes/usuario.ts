import express from "express";
import UsuarioController from "../controllers/usuario.controller";

const router = express.Router();

router
    .route("/all")
    .get(UsuarioController.getAll);



export default router;