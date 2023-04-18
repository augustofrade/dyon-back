import { body } from "express-validator";

import { validacaoEndereco } from "./endereco.validation";

const validacaoDadosEvento = [
    body("titulo")
        .notEmpty().withMessage("É obrigatório informar o Título do Evento")
        .bail()
        .isLength({ min: 10, max: 50 }).withMessage("O Título do Evento deve possuir entrre 10 e 50 caracteres"),
    body("descricao")
        .notEmpty().withMessage("É obrigatório informar a Descrição do Evento")
        .bail()
        .isLength({ min: 20 }).withMessage("A Descrição do Evento deve possuir no mínimo 20 caracteres"),
    body("inscricoesInicio")
        .notEmpty().withMessage("É obrigatório informar o Início das Inscrições do Evento"),
    body("inscricoesTermino")
        .notEmpty().withMessage("É obrigatório informar o Término das Inscrições do Evento"),
    body("categorias")
        .notEmpty().withMessage("É obrigatório selecionar ao menos uma categoria para o evento")
        .bail()
        .isArray({ min: 1 }).withMessage("Deve haver ao menos uma categoria atribuída ao evento"),
    body("operadores")
        .isArray().withMessage("Formato inválido de lista de operadores"),
    ...validacaoEndereco
];

export const validacaoNovoEvento = [
    ...validacaoDadosEvento
];

export const validacaoEdicaoEvento = [
    ...validacaoDadosEvento
];