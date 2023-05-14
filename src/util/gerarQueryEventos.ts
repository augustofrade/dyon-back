import { categoriaLista } from "../types/enums/categoriasEnum";
import { IPesquisaEvento } from "./../types/interface";

export const gerarQueryEventos = (pesquisa: IPesquisaEvento) => {
    const query: {
        $or?: unknown[],
        "categorias.titulo"? : string,
        "endereco.uf"? : string,
        cancelado: boolean,
        visivel: boolean
    } = {
        cancelado: false,
        visivel: true
    };

    if(pesquisa.search) {
        const regex = new RegExp(pesquisa.search, "i");
        query["$or"] = [        
            { "titulo": regex },
            { "criador.nome": regex },
            { "endereco.cidade" : regex },
            { "endereco.uf": regex }
        ];
    }
    if(pesquisa.category) {
        const tituloCategoria = categoriaLista().filter((v) => v[0] === pesquisa.category);
        if(tituloCategoria.length > 0)
            query["categorias.titulo"] = tituloCategoria[0][1];
    }
    if(pesquisa.uf) {
        query["endereco.uf"] = pesquisa.uf;
    }
    return query;
};