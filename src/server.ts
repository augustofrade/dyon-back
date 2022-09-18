import express from "express";
import { eventoRouter } from "./evento";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(express.static("./public"));
// Colocar CORS depois (já instalado)


//#region ROTAS
app.use("/api/eventos", eventoRouter);

//#endregion


app.listen(PORT, () => {
    console.log(`Listening ${PORT}`);
});