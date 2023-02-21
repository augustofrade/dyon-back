const validarSenha = (senha: string): boolean => {
    return new RegExp("^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\\D*\\d)(?=[^!#%]*[!#%])[A-Za-z0-9!#%]{6,32}$").test(senha);
};

export default validarSenha;