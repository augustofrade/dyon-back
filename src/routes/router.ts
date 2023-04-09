import express from "express";
import eventoRouter from "./evento";
import usuarioRouter from "./usuario";
import participanteRouter from "./participante";
import instituicaoRouter from "./instituicao";
import categoriaRouter from "./categoria";
import authRouter from "./auth";
import emailRouter from "./email";
import operadorRouter from "./operador";
import inscricaoRouter from "./inscricao";
import avaliacaoRouter from "./avaliacao";
import senhaRouter from "./senha";

const router = express.Router();
router.use("/eventos", eventoRouter);
router.use("/usuarios", usuarioRouter);
router.use("/participantes", participanteRouter);
router.use("/instituicoes", instituicaoRouter);
router.use("/categorias", categoriaRouter);
router.use("/auth", authRouter);
router.use("/email", emailRouter);
router.use("/operadores", operadorRouter);
router.use("/inscricoes", inscricaoRouter);
router.use("/avaliacoes", avaliacaoRouter);
router.use("/senha", senhaRouter);

export default router;