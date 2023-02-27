enum categoriasEnum {
    animais = "Animais",
    educacao = "Educação",
    esportes = "Esportes",
    infantil = "Infantil",
    lazer = "Lazer",
    negocios = "Negociós",
    palestra = "Palestra",
    shows = "Shows",
    tecnologia = "Tecnologia"
}

export const categoriaSlugs = (): Array<string> => Object.keys(categoriasEnum);
export const categoriaLista = () => Object.entries(categoriasEnum);

export default categoriasEnum;