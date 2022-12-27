import express from "express";
import UsuarioController from "../controllers/usuario.controller";

const router = express.Router();

// Cadastrar usuário
router
    .route("/users")
    .post((req, res) => UsuarioController.register(req, res));

router
    .route("/users/email")
    .post((req, res) => UsuarioController.findByEmail(req, res));

router
    .route("/users/all")
    .get((req, res) => UsuarioController.getAll(req, res));



export default router;