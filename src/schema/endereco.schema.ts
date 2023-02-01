import { prop, modelOptions } from "@typegoose/typegoose";

@modelOptions({ schemaOptions: { _id: false } })
class Endereco {
    @prop({ required: true })
    public logradouro!: string;

    @prop({ required: true })
    public bairro!: string;

    @prop({ required: true })
    public cidade!: string;

    @prop({ required: true, index: true })
    public uf!: string;

    @prop({ required: true, index: true })
    public cep!:string;
    
    @prop()
    public numero?: string;

    @prop()
    public referencia?: string;
}

export { Endereco };