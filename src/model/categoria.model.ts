import mongoose from "mongoose";
import ICategoriaVM from "../interfaces/ICategoriaVM";


export interface ICategoria {
    _id: string;
    titulo: string;
    imagem: Buffer;
}

export interface CategoriaModel extends mongoose.Model<ICategoria> {
    findAndConvertBase64(): ICategoriaVM[]
}

const CategoriaSchema = new mongoose.Schema<ICategoria, CategoriaModel>(
    {
        _id: String,
        titulo: {
            type: String,
            required: true,
            index: true
        },
        imagem: {
            type: Buffer,
            contentType: String,
        }
    },
    {
        statics: {
            /**
             * Método provisório para exibir as thumbnails de categorias na página de categorias
             * Analisar se neste caso vale a pena salvar como base 64 mesmo ou continuar como blob
             * @returns ICategoriaVM[]
             */
            async findAndConvertBase64() {
                return (await this.find()).map((c: ICategoria) => {
                    const imagem = c.imagem.toString("base64");
                    
                    const categoria: ICategoriaVM = {
                        slug: c._id,
                        titulo: c.titulo,
                        imagem
                    };

                    return categoria;
                });
            }
        }
    }
);

const Categoria = mongoose.model<ICategoria, CategoriaModel>("Categoria", CategoriaSchema);

export default Categoria;