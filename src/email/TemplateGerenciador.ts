import path from "path";
import fs from "fs";
import { IEmailTemplate } from "../types/interface";

const diretorioCompleto = (dir: string) => path.join(__dirname, dir);

class TemplateGerenciador {
    private static _instance: TemplateGerenciador; 
    public templates: Record<string, IEmailTemplate>;

    public constructor() {
        this.templates = {
            cadastro: {
                diretorio: diretorioCompleto("./templates/cadastro.ejs")
            },
            operador: {
                diretorio: diretorioCompleto("./templates/cadastroOperador.ejs")
            },
            confirmacaoEmail: {
                diretorio: diretorioCompleto("./templates/confirmacaoEmail.ejs")
            },
            recuperacaoSenha: {
                diretorio: diretorioCompleto("./templates/recuperacaoSenha.ejs")
            },
            alteracaoSenha: {
                diretorio: diretorioCompleto("./templates/alteracaoSenha.ejs")
            },
            falhaSenha: {
                diretorio: diretorioCompleto("./templates/falhaSenha.ejs")
            }
        };
    }

    public template(this: TemplateGerenciador, template: keyof typeof this.templates): string {
        if(this.templates[template].template === undefined)
            this.templates[template].template = fs.readFileSync(this.templates[template].diretorio, "utf-8");
        return this.templates[template].template as string;
    }

    public static limparCache() {
        if(!this._instance)
            throw new Error("Não foi definida uma instância dessa classes");
        this._instance = new TemplateGerenciador();
        return this._instance;
    }

    public static get Instance() {
        return this._instance || (this._instance = new TemplateGerenciador());
    } 
}

export default TemplateGerenciador;