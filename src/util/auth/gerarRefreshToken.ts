import { IUsuario } from "../../types/interface";
import jwt from "jsonwebtoken";

const gerarRefreshToken = (usuario: IUsuario, duracao = "30d"): string => {
    return jwt.sign({ userId: usuario.id, email: usuario.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: duracao });
};

export default gerarRefreshToken;