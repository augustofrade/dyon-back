import express from "express";
import AuthController from "../controllers/auth.controller";
import authAcessToken from "../middlewares/authAcessToken.middleware";

const router = express.Router();


router
    .route("/confirmar/:id")
    .post(authAcessToken, AuthController.login);
    

export default router;