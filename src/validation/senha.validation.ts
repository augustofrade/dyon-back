import { body } from "express-validator";

export const validacaoAtualizarSenha = [
    body("senhaAtual")
        .notEmpty().withMessage("É obrigatório informar a senha atual"),
    body("novaSenha")
        .notEmpty().withMessage("É obrigatório informar a nova senha")
        .bail()
        .isString().withMessage("Formato de senha inválido")
];

export const validacaoTokenSenha = [
    body("email")
        .notEmpty().withMessage("É obrigatório informar o e-mail para recuperação de senha")
        .bail()
        .isEmail().withMessage("Formato de e-mail inválido")
];

export const validacaoRecuperacaoSenha = [
    body("token")
        .notEmpty().withMessage("Um token de Recuperação de Senha não foi fornecido"),
    body("senha")
        .notEmpty().withMessage("É obrigatório informar a senha atual"),
    body("confirmarSenha")
        .notEmpty().withMessage("É obrigatório informar a senha atual")
];