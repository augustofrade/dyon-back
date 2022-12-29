# Back-End Dyon
API da aplicação Dyon, consumida pelo front-end desenvolvido em React.

## Executar
Para compilar, executar e observar alterações, digitar no terminal: `npm run dev`
	
## Pacotes
- Express
- Cors
- TS-Node-Dev
- Dotenv
- Mongoose
- Slugify

## Rotas da API e Controllers
Por questões de reutilização de código e acoplamento, a lógica/regras de negócio são separadas da declaração das rotas e seus métodos HTTP.

Desta maneira, as rotas da API estão localizadas no diretório **routes/** e mapeadas no arquivo **router.ts** no mesmo diretório.

E a lógica, por sua vez, no diretório **controllers**. Cada rota possui uma controller, que é definida como uma classe com métodos estáticos, sendo públicos os chamados pela respectiva rota, e privados aqueles que não são.

### Adicionando um novo grupo de rotas
Para adicionar um novo grupo de rotas basta criar seu respectivo arquivo conforme os que já existem, exportar o objeto *router*, importá-lo em **router.ts** e adicioná-lo ao router principal.

## Schemas e Models
O banco de dados utilizado é o MongoDB por meio da ODM Mongoose, logo, para que seja feita a manipulação dos dados e consulta ao banco de dados, é necessário que haja um Schema de alguma coleção ("tabela") desejada (ex: Usuario), e seu respectivo model para que a manipulação seja possível.
- O **Schema** é a definição do documento e coleção, onde são definidas as propriedadas esperadas. É possivel criá-lo a partir de `new mongoose.Schema({ ... })`.
- O **Model** é utilizado para a manipulação do documento (inserir, editar, excluir, visualizar), sendo o retorno de `mongoose.model("nomeDocumento", docSchema)"`. Esta função recebe como primeiro parâmetro o nome desejado para o documento (ex: nomeDocumento), e como segundo parâmetro o schema elaborado para ele (ex: docSchema).
Além disso, por estar sendo utilizado o typescript, é necessário criar uma interface (ex: IUsuario) para definir o generics tanto do Schema tanto do Model.
[Documentação do Mongoose](https://mongoosejs.com/docs/guide.html)

## Subdocumentos
Os subdocumentos são documentos/objetos que são definidos como propriedades de outros documentos. Eles não possuem um Model próprio, visto que serão usados apenas para definir sub-propriedades de alguma propriedade desejada, como no caso de um **endereço** (schema/endereco.schema.ts), que possui logradouro, cep, cidade, dentre outros.

Subdocumentos são **diferentes** de documentos aninhados no âmbito de que subdocumentos possuem a propriedade `_id` por padrão e que não é possível alterar suas propriedades sem que eles estejam criados dentro do documento pai; enquanto documentos aninhados estão sempre presentes, mesmo que vazios, não possuem Schema nem a propriedade `_id`. Para remover esta propriedade dos subdocumentos, basta apenas definir `_id: false`, no objeto do segundo parâmetro da declaração do Schema: `new mongoose.Schema({ ... }, { _id: false })`.

## Schema Discriminators
O discriminator é um mecanismo de herança que o Mongoose oferece para criar diferentes coleções a partir de apenas uma, de modo que todas tenham propriedades em comum, porém algumas diferentes entre si, sendo salvas como apenas uma coleção ("tabela").

No Dyon, há dois tipos de usuário: Participante e Instituição. Ambos possuem e-mail e senha, porém o primeiro possui informações pessoais, como cpf, data de nascimento e nome completo; enquanto o segundo, informações empresariais, como nome fantasia, razão social e cnpj. Os discriminators permitem que esses dois tipos de usuário sejam salvos sob uma única coleção, porém sejam distintos entre si, havendo a possibilidade de se registrar um ou outro, usar métodos próprios ou em comum (explicado na próxima seção), buscar todos os tipos de usuário, apenas Participantes, ou apenas Instituições, etc.

É importante ressaltar que para ser definido um novo Schema e Model por meio do discriminator é utilizado `modelBase.discriminator<IDerivado, DerivadoModel>("Derivado", DerivadoSchema)` ao invés de `mongoose.model<IDerivado, DerivadoModel>("Derivado", DerivadoSchema)`, onde **derivado** é o novo tipo de coleção e **base** a coleção base com as informações em comum. A definição de generics com *IDerivado* e *BaseModel* é necessário para que o mongoose e typescript saibam que é uma herança de *Derivado* apartir do *Base*.

A definição de generics e criação de propriedades são explicadas na seção seguinte.

[Documentação de Discriminator](https://mongoosejs.com/docs/discriminators.html)

## Definindo métodos estáticos para Models
É possível definir métodos estáticos para os Models para então utilizá-lo em uma instância do model. É útil para organizar consultas próprias ao banco sem redundância no código. Para fazê-lo basta:
- Criar a interface necessária do typescript para o Schema (ex: IUsuario), ou seja, apenas as **propriedades** do documento;
- Criar a interface necessária do typescript para o Model (ex: UsuarioModel) contendo apenas os **métodos** customizados do Model.
- Definir o generics do tipo de Schema e Model como as interfaces criadas anteriormente, ex: <IUsuario>.
- Adicionar no segundo parâmetro de `mongoose.Schema<D, T>({}, {})`, a propriedade statics, do tipo objeto, com os métodos como propriedades desejados definidos na interface de Model. Ex:
```
interface IUsuario {
    username: string;
    email: string;
    senha: string;
    emailConfirmado: boolean;
}

interface UsuarioModel extends mongoose.Model<IUsuario> {
    findByEmail(email: string): IUsuario
}

const usuarioSchema = new mongoose.Schema<IUsuario, UsuarioModel>(
{
        username: {
            type: String,
            required: true,
            index: true,
            unique: true
        },,
        senha: {
            type: String,
            require: true,
        },
    },
    {
        statics: {
            async findByEmail (email: string) {
                return this.findOne({ email });
            },
        }
    }
);

const Usuario = mongoose.model<IUsuario, UsuarioModel>("Usuario", usuarioSchema);
```

## JSDoc
Sendo importante documentar os métodos e interfaces da API, é possível fazê-lo na norma JSDoc:
- Escrita logo acima do tipo (type, class, interface, function, métodos, etc).
- Estruturada como um comentário, porém começando com dois astericos: \\**
- Parâmetros, propriedades etc devem começar com @
- No VS Code, será exibida ao se passar o mouse acima da implementação.

Exemplo:
```
/**
* Example Interface
* @property  {string}  label - Label of example
* @property  {string}  value - Value of example
* @property  {string}  available - Availability of example
*/
interface example {
    ...
}
```
[Documentação JSDoc com Typescript](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)

## Variáveis de Ambiente
As variáveis de ambiente são salvas no arquivo .ENV. Para acessar deve-se utilizar:
```
process.env.NOME_VAR
```

## Enums e Interfaces
Deve-se separar padrões de objetos (interfaces) e enums (propriedades imutáveis e pré-definidas) nos tipos respectivos.
Devido às configurações ESLint com Typescript, é **necessário** primeiro declarar a interface ou enum e então exportá-la(o) com `export default nome;` .
Diretórios:
- **/enums**
- **/interfaces**

## Fazendo uso do banco de dados
O banco de dados não é local, sendo hospedado em nuvem no MongoDB Atlas. Para que seja permitido seu uso, logo consultas ao banco de dados do Dyon, é necessário adicionar seu IP na allow list.

## Diretório Rest
Nele está contido requisições de teste ou padrão para os documentos do banco de dados, sendo utilizado pela extensão *REST Client* do VS Code.

Para fazer as requisições, basta clicar em "Send Request" acima de cada uma.

## Ajuda
- Os imports e exports estão sendo feitos na norma do ES6:
- Importar default: `import pacote from "pacote"`
- Importar objeto: `import * as pacote from "pacote"`
- Import destruct objeto: `import { fun1, fun2, ... } from "pacote"`
- Para exportar default: `export default objeto`
- Para exportar objeto: `export { fun1, fun2, ... }`