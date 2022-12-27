import express from "express";
import eventoRouter from "./evento";
import usuarioRouter from "./usuario";
import participanteRouter from "./participante";

const router = express.Router();
router.use("/", eventoRouter);
router.use("/", usuarioRouter);
router.use("/", participanteRouter);

export default router;