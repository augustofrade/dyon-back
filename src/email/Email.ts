import { IEmailCadastro } from "./../types/interface";
/* eslint-disable no-unused-vars */

import { IEmail, ITokenGenerico } from "../types/interface";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { DateTime } from "luxon";
import { Evento } from "../model/evento.model";

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
        this.templatesEmCache.confirmacaoEmail = fs.readFileSync(path.join(__dirname, "./template/confirmacaoEmail.ejs"), "utf-8");
        this.templatesEmCache.recuperacaoSenha = fs.readFileSync(path.join(__dirname, "./template/recuperacaoSenha.ejs"), "utf-8");
        this.templatesEmCache.alteracaoSenha = fs.readFileSync(path.join(__dirname, "./template/alteracaoSenha.ejs"), "utf-8");
        this.templatesEmCache.falhaSenha = fs.readFileSync(path.join(__dirname, "./template/falhaSenha.ejs"), "utf-8");
    }

    public async enviarEmailCadastro(destinatario: IEmailCadastro, nomeUsuario: string, token: ITokenGenerico) {
        const url = `https://localhost:3000/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(this.templatesEmCache.cadastro, { url, nomeUsuario, dataExpiracao, tipo: destinatario.tipo });

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
    
    public async enviarEmailEventoCriacao(destinatario: string, evento: Evento) {
        const url = `https://localhost:3000/email/${evento._publicId}/${evento.slug}`;
        const template = ejs.render(this.templatesEmCache.eventoCriacao, { });

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
        const url = `https://localhost:3000/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(this.templatesEmCache.confirmacaoEmail, { url, nomeUsuario, dataExpiracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Confirme o e-mail de sua conta Dyon",
            texto: `Confirme seu e-mail em: ${url}`,
            html: template
        });
    }

    public async enviarEmailRecuperacaoSenha(destinatario: string, nomeUsuario: string, token: ITokenGenerico) {
        const url = `https://localhost:3000/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(this.templatesEmCache.recuperacaoSenha, { url, nomeUsuario, dataExpiracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Recuperação de Senha",
            texto: `Foi solicitado um e-mail de recuperçaão de senha para sua conta no Dyon.
                Caso não tenha sido você que solicitou a recuperação de senha, ignore este e-mail. Para trocar de senha, acesse: ${url}`,
            html: template
        });
    }

    public async enviarEmailAlteracaoSenha(destinatario: string, nomeUsuario: string) {
        const url = "https://localhost:3000/senha/esqueci-minha-senha";
        const dataAlteracao = DateTime.now().toFormat("dd/mm/yyyy às HH:mm:ss");
        const template = ejs.render(this.templatesEmCache.alteracaoSenha, { url, nomeUsuario, dataAlteracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Aviso de Alteração de senha",
            texto: `A senha da sua conta Dyon foi alterada em ${dataAlteracao}
            Caso não tenha sido você que alterou sua senha, acesse: ${url}`,
            html: template
        });
    }

    public async enviarEmailFalhaSenha(destinatario: string, nomeUsuario: string) {
        const dataAlteracao = DateTime.now().toFormat("dd/mm/yyyy às HH:mm:ss");
        const template = ejs.render(this.templatesEmCache.falhaSenha, { nomeUsuario, dataAlteracao });

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