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
    body("telefone")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o Número de Telefone")
        .bail()
        .isLength({ min: 10, max: 16 }).withMessage("O número de Telefone deve ter entre 10 e 16 caracteres"),
    body("nomeFantasia")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o Nome Fantasia")
        .bail()
        .isLength({ min: 3, max: 40 }).withMessage("O Nome Fantasia deve ter entre 3 e 40 caracteres"),
    body("nomeRepresentante")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o Nome do Representante")
        .bail()
        .isLength({ max: 80 }).withMessage("O Nome do Representante deve ter no máximo 80 caracteres"),
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
    body("telefone")
        .optional()
        .trim()
        .isLength({ min: 10, max: 16 }).withMessage("O número de Telefone deve ter entre 10 e 16 caracteres"),
    body("nomeFantasia")
        .optional()
        .trim()
        .isLength({ min: 3, max: 40 }).withMessage("O Nome Fantasia deve ter entre 3 e 40 caracteres"),
    body("nomeRepresentante")
        .optional()
        .isLength({ max: 80 }).withMessage("O Nome do Representante deve ter no máximo 80 caracteres"),
];