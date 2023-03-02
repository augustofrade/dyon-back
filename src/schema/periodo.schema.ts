import { prop } from "@typegoose/typegoose";

class Periodo {
    @prop({ required: true })
    public inicio!: Date;
    
    @prop({ required: true })
    public termino!: Date;

    @prop({ min: 1 })
    public inscricoesMaximo?: number;
}

export { Periodo };