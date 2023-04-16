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
        query["categorias.titulo"] = pesquisa.category;
    }
    if(pesquisa.uf) {
        query["endereco.uf"] = pesquisa.uf;
    }
    return query;
};