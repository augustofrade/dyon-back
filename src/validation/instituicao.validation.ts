import { body } from "express-validator";

import { validacaoEndereco } from "./endereco.validation";

export const validacaoCadastroInstituicao = [
    body("email")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o e-mail")
        .bail()
        .isEmail().withMessage("Formato inválido de e-mail"),
    body("senha")
        .trim()
        .notEmpty().withMessage("É obrigatório informar a senha"),
    body("nomeFantasia")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o Nome Fantasia")
        .bail()
        .isLength({ min: 3, max: 40 }).withMessage("O Nome Fantasia deve ter entre 3 e 40 caracteres"),
    body("documento")
        .trim()
        .notEmpty().withMessage("É obrigatório informar seu Número do Documento (CPF ou CNPJ)")
        .bail()
        .isLength({ min: 14, max: 18 }).withMessage("Escreva todos os caracteres do seu número do documento"),
    ...validacaoEndereco
];

export const validacaoAtualizarInstituicao = [
    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Formato inválido de e-mail"),
    body("nomeFantasia")
        .optional()
        .trim()
        .isLength({ min: 3, max: 40 }).withMessage("O Nome Fantasia deve ter entre 3 e 40 caracteres")
];