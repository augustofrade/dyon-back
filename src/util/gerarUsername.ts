import slugify from "slugify";
import gerarIdAleatorio from "./gerarIDAleatorio";


const gerarUsername = (nome: string): string => {
    nome = nome.replace(/\$/gi, "");
    return slugify(nome, {
        replacement: "-",
        lower: true,
        remove: /[*+~.()""!:%$@]/g
      }) + "-" + gerarIdAleatorio(3);
};

export default gerarUsername;