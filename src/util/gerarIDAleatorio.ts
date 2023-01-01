import { customAlphabet } from "nanoid";


/**
 * Função para gerar ids aleatórios para documentos do banco de dados.
 * @param tamanho (default: 6) número de caracteres que o ID possuirá
 * @returns id composto de números com o tamanho especificado
 */
const gerarIdAleatorio = (tamanho = 6): string => {
    const caracteresValidos = "0123456789";
    const id = customAlphabet(caracteresValidos, tamanho);
    return id();
};

export default gerarIdAleatorio;