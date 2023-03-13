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
router.use("/evento", eventoRouter);
router.use("/usuario", usuarioRouter);
router.use("/participante", participanteRouter);
router.use("/instituicao", instituicaoRouter);
router.use("/categoria", categoriaRouter);
router.use("/auth", authRouter);
router.use("/email", emailRouter);
router.use("/operador", operadorRouter);
router.use("/inscricao", inscricaoRouter);
router.use("/avaliacao", avaliacaoRouter);
router.use("/senha", senhaRouter);

export default router;