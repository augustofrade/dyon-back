import { body } from "express-validator";

import { validacaoEndereco } from "./endereco.validation";

export const validacaoCadastroParticipante = [
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
    body("nomeCompleto")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o Nome Completo")
        .bail()
        .isLength({ min: 10, max: 60 }).withMessage("O Nome Completo deve ter entre 3 e 40 caracteres"),
    body("genero")
        .trim()
        .notEmpty().withMessage("É obrigatório informar o campo Gênero"),
    body("documento")
        .trim()
        .notEmpty().withMessage("É obrigatório informar seu Número do Documento (CPF ou CNPJ)")
        .bail()
        .isLength({ min: 14, max: 18 }).withMessage("Escreva todos os caracteres do seu número do documento"),
    body("dataNascimento")
        .notEmpty().withMessage("É obrigatório informar a Data de Nascimento")
        .bail()
        .isDate().withMessage("Formato inválido de Data de Nascimento"),
    ...validacaoEndereco
];

export const validacaoAtualizarParticipante = [
    body("email")
        .optional()
        .trim()
        .isEmail().withMessage("Formato inválido de e-mail"),
    body("telefone")
        .optional()
        .trim()
        .isLength({ min: 10, max: 16 }).withMessage("O número de Telefone deve ter entre 10 e 16 caracteres"),
    body("dataNascimento")
        .optional()
        .trim()
        .isDate().withMessage("Formato inválido de Data de Nascimento"),
    body("nomeCompleto")
        .optional()
        .trim()
        .isLength({ min: 10, max: 60 }).withMessage("O Nome Completo deve ter entre 10 e 60 caracteres caracteres"),
];