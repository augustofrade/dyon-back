import express from "express";
import UsuarioController from "../controllers/usuario.controller";

const router = express.Router();

// Cadastrar usuário
router
    .route("/register")
    .post(UsuarioController.register);

router
    .route("/email")
    .post(UsuarioController.findByEmail);

router
    .route("/all")
    .get(UsuarioController.getAll);



export default router;