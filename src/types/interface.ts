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
    inscricoesMaximo?: number;
}

export interface IEmail {
    assunto: string;
    texto?: string;
    html: string;
    anexos?: Array<{
        filename: string;
        path?: string;
        content?: string | Buffer;
        cid?: string;
    }>;
}

export interface IEmailCadastro {
    email: string;
    tipo: "Participante" | "Instituição";
}

export interface IEmailTemplate {
    diretorio: string;
    template?: string;
}

/**
 * Estrutura dos objetos de categorias que serão enviados ao front-end
 */
export interface ICategoria {
    slug: string;
    titulo: string;
}

export interface ITokenGenerico {
    hash: string;
    expiracao: Date;
}

export interface IResumoInscricao {
    nomeUsuario: string;
    confirmada: boolean;
}

export interface IInfoResumida {
    nome: string;
    username: string
    fotoPerfil: string | null;
    instituicao?: string;
    id: string;
}