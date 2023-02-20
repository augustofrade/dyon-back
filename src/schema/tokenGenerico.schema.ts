import { prop } from "@typegoose/typegoose";

class TokenGenerico {
    @prop()
    public _id!: string;

    @prop()
    public expiracao!: Date;
}

export { TokenGenerico };