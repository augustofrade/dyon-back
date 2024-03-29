import { body } from "express-validator";

export const validacaoCadastroOperador = [
    body("nomeCompleto")
        .notEmpty().withMessage("É obrigatório informar o Nome Completo"),
    body("email")
        .notEmpty().withMessage("É obrigatório informar o E-mail")
        .bail()
        .isEmail().withMessage("Formato de e-mail inválido"),
    body("telefone")
        .notEmpty().withMessage("É obrigatório informar o Número de Telefone"),
    
];

export const validacaoAtivacaoOperador = [
    body("token")
        .notEmpty().withMessage("Um token de ativação de conta não foi fornecido"),
    body("senha")
        .notEmpty().withMessage("É obrigatório informar a nova senha"),
    body("confirmarSenha")
        .notEmpty().withMessage("É obrigatório confirmar a nova senha")
];