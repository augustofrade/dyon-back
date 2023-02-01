/* eslint-disable no-unused-vars */


export interface IUsuario {
    id: string;
    email: string;
}

/**
 * Estrutura dos objetos de categorias que serão enviados ao front-end
 */
export interface ICategoriaVM {
    slug: string;
    titulo: string;
    imagem: string;
}

export interface IEmail {
    remetente?: string;
    destinatario: string;
    assunto: string;
    texto?: string;
    html?: string;
}

export interface IEmailProvider {
    enviarEmail(email: IEmail): Promise<boolean>;
    
}