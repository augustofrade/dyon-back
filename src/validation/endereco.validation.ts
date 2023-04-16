import { body } from "express-validator";

export const validacaoEndereco = [
    body("endereco.logradouro")
        .trim()
        .notEmpty().withMessage("O campo Logradouro do endereço é obrigatório"),
    body("endereco.bairro")
        .trim()
        .notEmpty().withMessage("O campo Bairro do endereço é obrigatório"),
    body("endereco.cidade")
        .trim()
        .notEmpty().withMessage("O campo Cidade do endereço é obrigatório"),
    body("endereco.uf")
        .trim()
        .notEmpty().withMessage("O campo Estado (UF) do endereço é obrigatório"),
    body("endereco.cep")
        .trim()
        .notEmpty().withMessage("O campo CEP do endereço é obrigatório"),
    body("endereco.numero")
        .trim()
        .optional(),
    body("endereco.referencia")
        .trim()
        .optional()  
];