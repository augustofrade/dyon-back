import express from "express";

const eventoRouter = express();

eventoRouter.use(express.json());

eventoRouter.get("/listar", (req, res) => {
    res.status(200).json({ sucesso: 1 });
});

export { eventoRouter };