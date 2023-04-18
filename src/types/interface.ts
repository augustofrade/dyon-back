import { EventoQuery } from "./types";

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
    id?: string;
    inicio: Date;
    termino: Date;
    inscricoesMaximo?: number;
}

export interface IPeriodoAtualizacao {
    adicionar?: IPeriodo[];
    atualizar?: IPeriodo[];
    deletar?: { id: string }[];
}

export interface IAvaliacao {
    evento: NonNullable<EventoQuery>;
    idEvento: string;
    nota: number;
    comentario?: string;
    dataParticipacao: Date;
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

export interface IIdentificacaoUsuario {
    nome: string;
    idUsuario?: string;
    username?: string;
}

export interface IPesquisaEvento {
    search?: string;
    category?: string;
    uf?: string;
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

export interface ICardEvento {
    id: string;
    titulo: string;
    banner: string;
    criador: IIdentificacaoUsuario;
    periodo: {
        inicio: Date;
        termino: Date;
    };
    endereco: IEndereco;
}

export interface IInfoResumida {
    nome: string;
    username: string
    fotoPerfil: string | null;
    instituicao?: string;
    id: string;
}

export interface IEndereco {
    logradouro: string;
    bairro: string;
    uf: string;
    cep:string;
    numero?: string;
    referencia?: string;
}