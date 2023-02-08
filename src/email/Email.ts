/* eslint-disable no-unused-vars */

import { IEmail, TokenGenerico } from "../types/interface";
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

        this.templatesEmCache.cadastro = fs.readFileSync(path.join(__dirname, "./templates/cadastro.html"), "utf-8");
    }

    public async enviarEmailDeCadastro(destinatario: string, nomeUsuario: string, token: TokenGenerico) {
        const url = `https://localhost:3000/email/${token.hash}`;
        const template = ejs.render(this.templatesEmCache.cadastro, { url, nomeUsuario, dataExpiracao: token.expiracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Crie",
            texto: `Cadastro concluído com sucesso, por favor clique no link a seguir para confirmar seu e-mail: ${url}`,
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