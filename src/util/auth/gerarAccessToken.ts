import { IUsuarioDocument } from "../../model/usuario.model";
import jwt from "jsonwebtoken";

const gerarAccesToken = (usuario: IUsuarioDocument, duracao = "5m"): string => {
    return jwt.sign({ idUser: usuario.id },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: duracao });
};

export default gerarAccesToken;