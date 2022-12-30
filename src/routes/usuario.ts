import express from "express";
import UsuarioController from "../controllers/usuario.controller";

const router = express.Router();

// Cadastrar usuário
router
    .route("/register")
    .post((req, res) => UsuarioController.register(req, res));

router
    .route("/email")
    .post((req, res) => UsuarioController.findByEmail(req, res));

router
    .route("/all")
    .get((req, res) => UsuarioController.getAll(req, res));



export default router;