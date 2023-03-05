export interface IUsuario {
    id: string;
    email: string;
}

export interface IInstituicaoConfig {
    exibirEndereco: boolean;
}

export interface IParticipanteConfig {
    exibirInscricoes: boolean;
    exibirCategorias: boolean;
    exibirSeguindo: boolean;
    exibirHistorico: boolean;
}

export interface IPeriodo {
    _id: string;
    inicio: Date;
    termino: Date;
}

/**
 * Estrutura dos objetos de categorias que serão enviados ao front-end
 */
export interface ICategoria {
    slug: string;
    titulo: string;
}

export interface IEmail {
    assunto: string;
    texto?: string;
    html: string;
}

export interface ITokenGenerico {
    hash: string;
    expiracao: Date;
}