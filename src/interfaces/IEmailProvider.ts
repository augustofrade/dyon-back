/* eslint-disable no-unused-vars */

import IEmail from "./IEmail";

interface IEmailProvider {
    enviarEmail(email: IEmail): Promise<boolean>;
    
}

export default IEmailProvider;