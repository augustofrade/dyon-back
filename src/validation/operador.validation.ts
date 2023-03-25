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

export const validacaoAlternarOperador = [
    body("idOperador")
        .notEmpty().withMessage("ID de operador não fornecido")
];

export const validacaoExcluirOperador = [
    body("idOperador")
        .notEmpty().withMessage("ID de operador não fornecido")
];