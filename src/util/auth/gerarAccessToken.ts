import { IUsuario } from "../../types/interface";
import jwt from "jsonwebtoken";

const gerarAccesToken = (usuario: IUsuario, duracao = "5m"): string => {
    return jwt.sign({ userId: usuario.id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: duracao });
};

export default gerarAccesToken;