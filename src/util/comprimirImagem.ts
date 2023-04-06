import sharp from "sharp";

export const comprimirImagem = (buffer: Buffer, largura: number, altura?: number ) => {
    return sharp(buffer).resize(largura, altura).jpeg().toBuffer();
};