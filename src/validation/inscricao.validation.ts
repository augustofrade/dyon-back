import { body, param } from "express-validator";

export const validacaoNovaInscricao = [
    body("idEvento")
        .notEmpty().withMessage("O ID de evento é obrigatório")
        .bail()
        .isString().withMessage("Formato de ID de evento inválido"),
    body("idPeriodo")
        .notEmpty().withMessage("O ID de período é obrigatório")
        .bail()
        .isString().withMessage("Formato de ID de período inválido")
];

export const validacaoCancelarInscricao = [
    body("idInscricao")
        .notEmpty().withMessage("O ID de inscrição é obrigatório")
        .bail()
        .isString().withMessage("FOrmato de ID de inscrição inválido")
];

export const validacaoConfirmarInscricao = [
    param("idInscricao")
        .isString().withMessage("Formato de ID de inscrição inválido")
];