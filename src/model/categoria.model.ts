import { prop, getModelForClass } from "@typegoose/typegoose";

class Categoria {
    @prop({ required: true })
    public _id!: string;

    @prop({ required: true, index: true })
    public titulo!: string;
}

const CategoriaModel = getModelForClass(Categoria);

export { CategoriaModel, Categoria };