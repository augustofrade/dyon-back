import { body, cookie } from "express-validator";

export const validacaoLogin = [
    body("email")
        .notEmpty().withMessage("Informe seu e-mail")
        .isEmail().withMessage("O e-mail fornecido não é válido"),
    body("senha")
        .notEmpty().withMessage("Informe sua senha")
        .isString().withMessage("A senha fornecida não é válida")
];

export const validacaoAccessToken = [
    cookie("token")
        .notEmpty().withMessage("Você não está autenticado")
        .isString().withMessage("Token de autenticação inválido")
];