import { categoriaLista } from "../types/enums/categoriasEnum";
import { CategoriaModel } from "../model/categoria.model";

const popularCategorias = async () => {
    const categorias = categoriaLista().map(([slug, titulo]) => ({ _id: slug, titulo }));
    await CategoriaModel.create(categorias).then(_ => {
        console.log(categorias.length + " categorias adicionadas");
    }).catch((err) => {
        console.log(err);
    });
};

export default popularCategorias;