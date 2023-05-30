/* eslint-disable no-useless-escape */
import ejs from "ejs";
import { DateTime } from "luxon";
import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import path from "path";

import { Evento } from "../model/evento.model";
import { Periodo } from "../model/periodo.model";
import { IEmail, IIdentificacaoEvento, ITokenGenerico } from "../types/interface";
import { IEmailCadastro } from "./../types/interface";
import TemplateGerenciador from "./TemplateGerenciador";
import { appURL } from "../config";

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
        const url = `${appURL}/email/${token.hash}`;
        const dataExpiracao = DateTime.fromJSDate(token.expiracao).toFormat("HH:mm:ss");
        const template = ejs.render(nomeTemplate, { url, nomeUsuario, dataExpiracao, tipo: destinatario.tipo });

        return this.enviarEmailGenerico(destinatario.email, {
            assunto: "Cadastro realizado com sucesso",
            texto: `Cadastro realizado com sucesso, por favor clique no link a seguir para confirmar seu e-mail: ${url}`,
            html: template
        });
    }


    public async enviarEmailOperador(destinatario: string, nomeUsuario: string, nomeInstituicao: string, token: ITokenGenerico) {
        const url = `${appURL}/operador/ativacao/${token.hash}`;
        const nomeTemplate = TemplateGerenciador.Instance.template("operador");
        const template = ejs.render(nomeTemplate, { nomeUsuario, nomeInstituicao, url });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `Novo cadastro no Dyon por ${nomeInstituicao}`,
            texto: `Para você pode começar a confirmar inscrições de participantes nos eventos de ${nomeInstituicao},
                defina sua senha na url ${url}`,
            html: template
        });
    }

    public async enviarEmailAtivacaoOperador(destinatario: string, nomeUsuario: string, nomeInstituicao: string, token: ITokenGenerico) {
        const url = `${appURL}/operador/ativacao/${token.hash}`;
        const nomeTemplate = TemplateGerenciador.Instance.template("ativacaoOperador");
        const template = ejs.render(nomeTemplate, { nomeUsuario, nomeInstituicao, url });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Ative sua conta no Dyon",
            texto: `Para você pode começar a confirmar inscrições de participantes nos eventos de ${nomeInstituicao},
                ative sua conta definindo sua senha na url ${url}`,
            html: template
        });
    }

    public async enviarEmailInscricaoConfirmada(destinatario: string, nomeUsuario: string, nomeEvento: string, nomeInstituicao: string) {
        const nomeTemplate = TemplateGerenciador.Instance.template("inscricaoConfirmada");
        const template = ejs.render(nomeTemplate, { nomeUsuario, nomeEvento, nomeInstituicao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `Sua inscrição em ${nomeEvento} foi validada`,
            texto: `Não se esqueça de escrever uma avaliação para que ${nomeInstituicao} saiba o que você achou do evento.`,
            html: template
        });
    }
    
    public async enviarEmailEventoCriacao(destinatario: string, evento: Evento) {
        const nomeTemplate = TemplateGerenciador.Instance.template("eventoCriacao");
        const url = `${appURL}/email/${evento._publicId}/${evento.slug}`;
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
        const url = `${appURL}/email/${token.hash}`;
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
        const url = `${appURL}/recuperar-senha/${token.hash}`;
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
        const url = "${appURL}/senha/esqueci-minha-senha";
        const dataAlteracao = DateTime.now().toFormat("dd/MM/yyyy 'às' HH:mm:ss");
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
        const dataAlteracao = DateTime.now().toFormat("dd/MM/yyyy 'às' HH:mm:ss");
        const template = ejs.render(nomeTemplate, { nomeUsuario, dataAlteracao });

        return this.enviarEmailGenerico(destinatario, {
            assunto: "Aviso de Tentativa de Alteração de Senha",
            texto: `Houve uma tentativa de alteração de senha em sua conta em ${dataAlteracao},
                considere atualizá-la nas configurações de seu perfil`,
            html: template
        });
    }

    public async enviarAvisoCancelamentoPeriodo(destinatario: string, detalhesEvento: IIdentificacaoEvento, periodo: Periodo) {
        const rawHTML = TemplateGerenciador.Instance.template("avisoCancelamentoPeriodo");
        const url = `${appURL}/evento/${detalhesEvento.rotaPublica}`;
        const evento = {
            titulo: detalhesEvento.titulo,
            url,
            instituicao: detalhesEvento.instituicao.nome,
            inicio: DateTime.fromJSDate(periodo.inicio).toFormat("dd/MM/yyyy 'às' HH:mm:ss"),
            termino: DateTime.fromJSDate(periodo.termino).toFormat("dd/MM/yyyy 'às' HH:mm:ss"),
        };
        const template = ejs.render(rawHTML, { evento });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `${detalhesEvento.titulo} foi cancelado`,
            texto: `O evento ${evento.titulo} sediado pela instituição ${evento.instituicao}
            no período de ${evento.inicio} até ${evento.termino} foi cancelado. Confira a página do evento para mais detalhes: ${evento.url}`,
            html: template
        });
    }

    public async enviarAvisoCancelamentoEvento(destinatario: string, detalhesEvento: Evento, periodo: Periodo) {
        const rawHTML = TemplateGerenciador.Instance.template("avisoCancelamentoEvento");
        const url = `${appURL}/evento/${detalhesEvento._publicId}/${detalhesEvento.slug}`;
        const evento = {
            titulo: detalhesEvento.titulo,
            url,
            instituicao: detalhesEvento.criador.nome,
            data: DateTime.fromJSDate(periodo.inicio).toFormat("dd/MM/yyyy 'às' HH:mm"),
        };
        const template = ejs.render(rawHTML, { evento });

        return this.enviarEmailGenerico(destinatario, {
            assunto: `${detalhesEvento.titulo} foi cancelado`,
            texto: `O evento ${evento.titulo} sediado pela instituição ${evento.instituicao}
            no dia ${evento.data} foi cancelado. Confira a página do evento para mais detalhes: ${evento.url}`,
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