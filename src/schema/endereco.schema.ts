/* eslint-disable no-unused-vars */
import mongoose from "mongoose";


export interface IEndereco {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep?: string;
    numero?: string;
    referencia?: string;
}

/**
 * Pelo fato de o endereço não ser salvo em uma coleção própria,
 * mas sim como propriedade de algum documento, como Participante e Evento,
 * ele é se torna um subdocumento.
 * O uso mais adequado nesse caso é de se criar um **subdocumento** (o Schema) para esses usos,
 * **sem a necessidade de haver um Model para ele**.
 *
 * A outra possibilidade seria apenas criar um documento **aninhado**
 * com as propriedades desejadas. Porém o uso é um pouco diferente.
 * 
 * [Documentação aqui](https://mongoosejs.com/docs/subdocs.html)
 */
const EnderecoSchema = new mongoose.Schema<IEndereco>(
    {
        logradouro: {
            type: String,
            required: true
        },
        bairro: {
            type: String,
            required: true
        },
        cidade: {
            type: String,
            required: true
        },
        uf: {
            type: String,
            required: true,
            index: true
        },
        cep: {
            type: String,
            index: true
        },
        numero: String,
        referencia: String,
        
    },
    {
        discriminatorKey: "kind",
        timestamps: true
    }
);

export default EnderecoSchema;