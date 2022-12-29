import mongoose from "mongoose";


export interface ICategoria {
    _id: string;
    titulo: string;
    imagem: Buffer;
}

const CategoriaSchema = new mongoose.Schema<ICategoria>(
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
    }
);

const Categoria = mongoose.model<ICategoria>("Categoria", CategoriaSchema);

export default Categoria;