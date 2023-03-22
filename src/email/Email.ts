/* eslint-disable no-useless-escape */
import { IEmailCadastro } from "./../types/interface";

import { IEmail, ITokenGenerico } from "../types/interface";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";
import ejs from "ejs";
import { DateTime } from "luxon";
import { Evento } from "../model/evento.model";
import TemplateGerenciador from "./TemplateGerenciador";

export default class Email {
    private static _instance: Email;
    public readonly REMETENTE;
    private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;


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

    }

    public async enviarEmailCadastro(destinatario: IEmailCadastro, nomeUsuario: string, token: ITokenGenerico) {
        const nomeTemplate = TemplateGerenciador.Instance.template("cadastro");
        const url = `https://localhost:3000/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(nomeTemplate, { url, nomeUsuario, dataExpiracao, tipo: destinatario.tipo });

        return this.enviarEmailGenerico(destinatario.email, {
            assunto: "Cadastro realizado com sucesso",
            texto: `Cadastro realizado com sucesso, por favor clique no link a seguir para confirmar seu e-mail: ${url}`,
            html: template
        });
    }


    public async enviarEmailOperador(destinatario: string, nomeUsuario: string, nomeInstituicao: string) {
        const nomeTemplate = TemplateGerenciador.Instance.template("operador");
        const template = ejs.render(nomeTemplate, { nomeUsuario, nomeInstituicao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `Novo cadastro no Dyon por ${nomeInstituicao}`,
            texto: `Agora você pode começar a confirmar inscrições de participantes nos eventos de ${nomeInstituicao}!`,
            html: template
        });
    }
    
    public async enviarEmailEventoCriacao(destinatario: string, evento: Evento) {
        const nomeTemplate = TemplateGerenciador.Instance.template("eventoCriacao");
        const url = `https://localhost:3000/email/${evento._publicId}/${evento.slug}`;
        const template = ejs.render(nomeTemplate, { });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `Evento ${evento.titulo} criado com sucesso no Dyon`,
            texto: `Seu novo evento "${evento.titulo}" foi criado no Dyon em: ${url}`,
            html: template,
            anexos: [{
                filename: "Banner do Evento",
                cid: "unique@banner",
                content: evento.banner
            }]
        });
    }

    public async enviarEmailConfirmacao(destinatario: string, nomeUsuario: string, token: ITokenGenerico) {
        const nomeTemplate = TemplateGerenciador.Instance.template("confirmacaoEmail");
        const url = `https://localhost:3000/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(nomeTemplate, { url, nomeUsuario, dataExpiracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Confirme o e-mail de sua conta Dyon",
            texto: `Confirme seu e-mail em: ${url}`,
            html: template
        });
    }

    public async enviarEmailRecuperacaoSenha(destinatario: string, nomeUsuario: string, token: ITokenGenerico) {
        const nomeTemplate = TemplateGerenciador.Instance.template("recuperacaoSenha");
        const url = `https://localhost:3000/recuperar-senha/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(nomeTemplate, { url, nomeUsuario, dataExpiracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Recuperação de Senha",
            texto: `Foi solicitado um e-mail de recuperçaão de senha para sua conta no Dyon.
                Caso não tenha sido você que solicitou a recuperação de senha, ignore este e-mail. Para trocar de senha, acesse: ${url}`,
            html: template
        });
    }

    public async enviarEmailAlteracaoSenha(destinatario: string, nomeUsuario: string) {
        const nomeTemplate = TemplateGerenciador.Instance.template("alteracaoSenha");
        const url = "https://localhost:3000/senha/esqueci-minha-senha";
        const dataAlteracao = DateTime.now().toFormat("dd/MM/yyyy à\s HH:mm:ss");
        const template = ejs.render(nomeTemplate, { url, nomeUsuario, dataAlteracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Aviso de Alteração de senha",
            texto: `A senha da sua conta Dyon foi alterada em ${dataAlteracao}
            Caso não tenha sido você que alterou sua senha, acesse: ${url}`,
            html: template
        });
    }

    public async enviarEmailFalhaSenha(destinatario: string, nomeUsuario: string) {
        const nomeTemplate = TemplateGerenciador.Instance.template("falhaSenha");
        const dataAlteracao = DateTime.now().toFormat("dd/MM/yyyy à\s HH:mm:ss");
        const template = ejs.render(nomeTemplate, { nomeUsuario, dataAlteracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Aviso de Tentativa de Alteração de Senha",
            texto: `Houve uma tentativa de alteração de senha em sua conta em ${dataAlteracao},
                considere atualizá-la nas configurações de seu perfil`,
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
            attachments: [
                {
                    filename: "Logo.png",
                    path: path.join(__dirname, "../../public/img/logo/logo_default.png"),
                    cid: "unique@logo",
                },
                ...email.anexos ?? []
            ]
        });
    }

    public static get Instance() {
        return this._instance || (this._instance = new Email());
    }
}