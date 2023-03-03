import jwt from "jsonwebtoken";
import { DateTime } from "luxon";

import { IUsuario } from "../../types/interface";


const gerarRefreshToken = (usuario: IUsuario, duracao = "30d"): {token: string, dataExpiracao: Date } => {
    const token = jwt.sign({ userId: usuario.id, email: usuario.email },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: duracao });

    const dataExpiracao = DateTime.now().plus({ days: 30 }).toJSDate();

    return { token, dataExpiracao };
};

export default gerarRefreshToken;