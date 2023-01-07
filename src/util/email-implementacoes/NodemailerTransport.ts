/* eslint-disable no-empty-function */
import IEmail from "../../interfaces/IEmail";
import IEmailProvider from "../../interfaces/IEmailProvider";
import nodemailer from "nodemailer";

export default class NodemailerTransport implements IEmailProvider {
    private transporter: nodemailer.Transporter;

    constructor(
        private readonly user: string,
        private readonly senha: string
    ) {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
              user: user,
              pass: senha,
            },
          });

    }

    public async enviarEmail(email: IEmail): Promise<boolean> {
        try {
            const sucesso = await this.transporter.sendMail({
                from: `Dyon <${email.remetente}>`,
                to: email.destinatario,
                subject: email.assunto,
                text: email.texto,
                html: email.html
            });
            return sucesso;
        } catch (err) {
            console.log(err);
            return false;
        }
    }
}