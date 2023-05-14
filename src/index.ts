import express from "express";
import routes from "./routes/router";
import * as dotenv from "dotenv";
import dbConnect from "./db";
import cookieParser from "cookie-parser";
import cors from "cors";
import { dominiosPermitidos } from "./config";

dotenv.config();

dbConnect(process.env.DB_DEV as string);

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static("./public"));

app.use(cors({
    origin: dominiosPermitidos,
    credentials:true,
    preflightContinue: true,
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    exposedHeaders: "*"
}));


app.use("/api", routes);


app.listen(PORT, () => {
    console.log(`Listening ${process.env.PORT}`);
});