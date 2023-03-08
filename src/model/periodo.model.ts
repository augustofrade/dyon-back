import { prop, ReturnModelType } from "@typegoose/typegoose";

class Periodo {
    @prop({ required: true })
    public inicio!: Date;
    
    @prop({ required: true })
    public termino!: Date;

    @prop({ min: 1 })
    public inscricoesMaximo?: number;

    @prop({ default: false })
    public cancelado!: boolean;
}

export { Periodo };