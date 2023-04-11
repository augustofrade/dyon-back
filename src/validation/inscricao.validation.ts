import { body } from "express-validator";

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