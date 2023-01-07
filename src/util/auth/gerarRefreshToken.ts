import { IUsuarioDocument } from "../../model/usuario.model";
import jwt from "jsonwebtoken";

const gerarRefreshToken = (usuario: IUsuarioDocument, duracao = "30d"): string => {
    return jwt.sign({ idUser: usuario.id, email: usuario.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: duracao });
};

export default gerarRefreshToken;