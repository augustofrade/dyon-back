import slugify from "slugify";


const gerarSlug = (text: string): string => {
    text = text.replace(/\$/gi, "");
    return slugify(text, {
        replacement: "-",
        lower: true,
        remove: /[*+~.()""!:%$@]/g
      });
};

export default gerarSlug;