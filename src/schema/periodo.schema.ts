import { prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { _id: false } })
class Periodo {
    @prop({ required: true })
    public inicio!: Date;
    
    @prop({ required: true })
    public termino!: Date;
}

export { Periodo };