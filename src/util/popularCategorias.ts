import { CategoriaModel } from "../model/categoria.model";
import fs from "fs";
import path from "path";

/**
 * Classe para gerar as categorias no banco de dados
 * utilizadas pelos eventos criados por usuários.
 * 
 * Executar seu método principal apenas quando
 * não houver categorias registradas na collection.
 */
export default class popularCategorias {
    static categorias: { _id: string, titulo: string, imagem: Buffer }[] = [];

    static categoriasTexto: Record<string, string> = {
        animais: "Animais",
        educacao: "Educacão",
        esportes: "Esportes",
        infantil: "Infantil",
        lazer: "Lazer",
        negocios: "Negócios",
        palestra: "palestra",
        shows: "Shows",
        tecnologia: "Tecnologia",
    };

    /**
     * Método chamado para começar os procedimentos de popular a collection de categorias
     */
    public static popular(): void {
        this.buscarImagens();
    }

    /**
     * Busca as imagens no diretório público e extrai os slugs das categorias por meio do nome delas
     * para então criar o objeto de uma categoria e salvá-las
     */
    private static buscarImagens(): void {
        
        fs.readdir(path.join(__dirname, "../../public/img/categorias"), (err, files) => {
            if(err) console.log("Diretório de categorias não encontrado");
            else {
                console.log("Populando categorias");
                files.forEach(file => {
                    try {
                        const buffer = fs.readFileSync(path.join(__dirname, "../../public/img/categorias", file));
                        let slug = file.split("-")[1];
                        slug = slug.substring(0, slug.indexOf("."));
                        this.gerarCategoria(slug, buffer);
                    } catch (err) {
                        console.log(err);
                    }
                });
                this.salvarCategorias();
            }
        });
    }

    /**
     * Cria um objeto e armazena na lista de categorias lidas que serão salvas
     * @param slug slug da categoria extraído por meio do nome da imagem
     * @param bytesImagem bytes da imagem
     */
    private static gerarCategoria(slug: string, bytesImagem: Buffer) {
        const titulo = this.categoriasTexto[slug];
        this.categorias.push({
            _id: slug,
            titulo,
            imagem: bytesImagem
        });
    }

    /**
     * Salva as categorias de uma só vez
     */
    private static salvarCategorias(): void {
        CategoriaModel.create(this.categorias).then(() => {
            console.log("Categorias criadas");
        });
    }
}