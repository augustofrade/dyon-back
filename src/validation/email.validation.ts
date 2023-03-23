import { body } from "express-validator";

export const validacaoConfirmarEmail = [
    body("token").isString().withMessage("Não foi encontrado um token de confirmação de e-mail")
];