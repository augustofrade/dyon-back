/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-unused-vars */
import { prop, getModelForClass, ReturnModelType } from "@typegoose/typegoose";
import { ICategoriaVM } from "../types/interface";

class Categoria {
    @prop({ required: true })
    public _id!: string;

    @prop({ required: true, index: true })
    public titulo!: string;

    @prop()
    public imagem?: Buffer;


    // TODO: definir se é viável guardar as imagens das categorias em base 64
    /**
    * Método provisório para exibir as thumbnails de categorias na página de categorias
    * Analisar se neste caso vale a pena salvar como base 64 mesmo ou continuar como blob
    * @returns ICategoriaVM[]
    */
    static async findAndConvertBase64(this: ReturnModelType<typeof Categoria>) {
        return (await this.find()).map(c => {
            const imagem = c.imagem!.toString("base64");
            
            const categoria: ICategoriaVM = {
                slug: c._id,
                titulo: c.titulo,
                imagem
            };

            return categoria;
        });
    }
}

const CategoriaModel = getModelForClass(Categoria);

export { CategoriaModel, Categoria };