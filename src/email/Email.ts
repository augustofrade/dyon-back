import { IEmailCadastro } from "./../types/interface";
/* eslint-disable no-unused-vars */

import { IEmail, ITokenGenerico } from "../types/interface";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "fs";
import path from "path";
import ejs from "ejs";

export default class Email {
    private static _instance: Email;
    public readonly REMETENTE;
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
    private readonly templatesEmCache: Record<string, string> = {};


    private constructor() {
        const emailUser = process.env.EMAIL_USER as string;
        const emailPass = process.env.EMAIL_PASS as string;
        this.REMETENTE = emailUser;

        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: emailUser,
              pass: emailPass,
            }
        });

        this.templatesEmCache.cadastro = fs.readFileSync(path.join(__dirname, "./template/cadastro.ejs"), "utf-8");
        this.templatesEmCache.operador = fs.readFileSync(path.join(__dirname, "./template/cadastroOperador.ejs"), "utf-8");
    }

    public async enviarEmailDeCadastro(destinatario: IEmailCadastro, nomeUsuario: string, token: ITokenGenerico) {
        const url = `https://localhost:3000/email/${token.hash}`;
        const template = ejs.render(this.templatesEmCache.cadastro, { url, nomeUsuario, dataExpiracao: token.expiracao, tipo: destinatario.tipo });

        return this.enviarEmailGenerico(destinatario.email, {
            assunto: "Cadastro realizado com sucesso",
            texto: `Cadastro realizado com sucesso, por favor clique no link a seguir para confirmar seu e-mail: ${url}`,
            html: template
        });
    }

    public async enviarEmailOperador(destinatario: string, nomeUsuario: string, nomeInstituicao: string) {
        const template = ejs.render(this.templatesEmCache.operador, { nomeUsuario, nomeInstituicao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `Novo cadastro no Dyon por ${nomeInstituicao}`,
            texto: `Agora você pode começar a confirmar inscrições de participantes nos eventos de ${nomeInstituicao}!`,
            html: template
        });
    }

    // Adicionar mais modelos de e-mail...

    private async enviarEmailGenerico(destinatario: string, email: IEmail): Promise<SMTPTransport.SentMessageInfo> {
        return this.transporter.sendMail({
            from: `"Dyon Eventos" <${this.REMETENTE}>`,
            to: destinatario,
            subject: email.assunto,
            text: email.texto,
            html: email.html,
            attachments: [{
                filename: "Logo.png",
                path: path.join(__dirname, "../../public/img/logo/logo_default.png"),
                cid: "unique@logo"
            }]
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new Email());
    }
}