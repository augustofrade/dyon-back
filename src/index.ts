/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */

import express from "express";
import routes from "./routes/router";
import * as dotenv from "dotenv";
import dbConnect from "./db";
import cookieParser from "cookie-parser";

// Receber valor do arquivo .ENV
dotenv.config();

dbConnect(process.env.DB_DEV as string);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("./public"));
// Colocar CORS depois (já instalado)

app.use("/api", routes);


app.listen(PORT, () => {
    console.log(`Listening ${process.env.PORT}`);
});