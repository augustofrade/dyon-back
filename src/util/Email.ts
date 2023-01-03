/* eslint-disable no-unused-vars */
/* eslint-disable no-empty-function */


import IEmail from "../interfaces/IEmail";
import IEmailProvider from "../interfaces/IEmailProvider";
import NodemailerTransport from "./email-implementacoes/NodemailerTransport";



export default class Email {
    private _email?: IEmail;
    public readonly REMETENTE;
    private emailProvider: IEmailProvider;


    constructor(emailProvider?: IEmailProvider) {
            const emailUser = process.env.EMAIL_USER as string;
            const emailPass = process.env.EMAIL_PASS as string;

            this.emailProvider = emailProvider || new NodemailerTransport(emailUser, emailPass);
            this.REMETENTE = emailUser;
    }

    public definir(email: IEmail): Email {
        this._email = email;
        this._email.remetente = this.REMETENTE;
        return this;
    }

    public async enviar(): Promise<unknown> {
        if(this._email === undefined) return false;
        
        const enviado = this.emailProvider.enviarEmail(this._email);
        
        return enviado;
    }
}