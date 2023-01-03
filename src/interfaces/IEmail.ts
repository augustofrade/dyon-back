interface IEmail {
    remetente?: string;
    destinatario: string;
    assunto: string;
    texto?: string;
    html?: string;
}

export default IEmail;