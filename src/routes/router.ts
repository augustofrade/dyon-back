import express from "express";
import eventoRouter from "./evento";
import usuarioRouter from "./usuario";
import participanteRouter from "./participante";
import categoriaRouter from "./categoria";
import authRouter from "./auth";

const router = express.Router();
router.use("/evento", eventoRouter);
router.use("/usuario", usuarioRouter);
router.use("/participante", participanteRouter);
router.use("/categoria", categoriaRouter);
router.use("/auth", authRouter);

export default router;