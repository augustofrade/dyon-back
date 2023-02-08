# Back-End Dyon
API da aplicação Dyon, consumida pelo front-end desenvolvido em React.

## Executar
Para compilar, executar e observar alterações, digitar no terminal: `npm run dev`
	
## Pacotes
- Express
- Cors
- Mongoose
- Slugify
- Nano ID
- Cookie Parser
- jsonwebtoken
- TS-Node-Dev

## Rotas da API e Controllers
Por questões de reutilização de código e acoplamento, a lógica/regras de negócio são separadas da declaração das rotas e seus métodos HTTP.

Desta maneira, as rotas da API estão localizadas no diretório **routes/** e mapeadas no arquivo **router.ts** no mesmo diretório.

E a lógica, por sua vez, no diretório **controllers**. Cada rota possui uma controller, que é definida como uma classe com métodos estáticos, sendo públicos os chamados pela respectiva rota, e privados aqueles que não são.

### Adicionando um novo grupo de rotas
Para adicionar um novo grupo de rotas basta criar seu respectivo arquivo conforme os que já existem, exportar o objeto *router*, importá-lo em **router.ts** e adicioná-lo ao router principal.

## Autenticação
Ao fazer login, o usuário deve poder se manter autenticado, logo será retornado dois tokens para ele:
- **Refresh Token**: mantém a sessão do usuário.
  - Deve durar 1 mês.
  - Deve ser salvo nos cookies e configurado da seguinte maneira: `{ httpOnly: true, secure: true, sameSite: ”None” }`.
- **Access Token**: utilizado em conjunto do refresh token para permitir o acesso à rotas e recursos protegidos. A cada requisição à API é verificado se não foi expirado, e caso tenha sido, é gerado um novo.
  - Deve durar 5 minutos.
  - Deve ser utilizado no header “Authorization”, com Bearer, das requisições.

Para acessar rotas protegidas, é verificado o **Access Token**. Caso tenha sido expirado e a requisição possua um Refresh Token em seus cookies, é gerado e retornado um novo Access Token. Isso garante que caso o Access Token seja roubado, ele não possa mais ser utilizado após um curto período de tempo. Além disso, sem o Refresh Token ou com um que seja inválido, não serão gerados mais Access Tokens.

- Os tokens são gerados com hashes no padrão JWT.
- No caso da biblioteca utilizada (jsonwebtoken), é ser informado apenas o payload, o secret e opções da signature.
  - Payload: objeto com os dados desejados. No caso, apenas o id do usuário. ex: { id: user._id }.
  - Opções da signature: tempo de expiração, etc.

Para fazer que seja necessário a autenticação em alguma rota ou grupo de rotas, deve-se utilizar o middleware **authAccessToken.middleware.ts** como callback do router ou uma rota em específico: `router.use(authAccessToken)` ou `router.route(" ... ").get(authAccessToken, handler)`.

Abaixo estão listadas as rotas de autorização

### /auth/login
Realiza login

**Parâmetros**:

|Parâmetro|  tipo  |    Descrição    |
|---------|--------|-----------------|
|  email  |*string*|E-mail do usuário|
|  senha  |*string*|Senha do usuário |

### /auth/logout
Realiza logout

- Necessita de cookie nomeado "*token*" contendo um Refresh Token válido.

### /auth/token
Gera novo Access Token
- Necessita de cookie nomeado "*token*" contendo um Refresh Token válido.

## Schemas e Models
O banco de dados utilizado é o MongoDB por meio da ODM Mongoose com Schemas e Models definidos pelo Typegoose, logo, para que seja feita a manipulação dos dados e consulta ao banco de dados, é necessário que haja um Schema de alguma coleção ("tabela") desejada (ex: Usuario), e seu respectivo model para que a manipulação seja possível.
- O **Schema** é a definição do documento e coleção, onde são definidas as propriedadas esperadas. Como é utilizado o Typegoose, para ser criada um Schema basta declarar uma classe com o nome do Schema (caso não seja alterado com o decorator `@modelOptions`) e definir suas propriedades como atributos da classe com o decorator `@prop()`.
- O **Model** é utilizado para a manipulação do documento (inserir, editar, excluir, visualizar), sendo o retorno da função `getModelForClass(Model)`. Esta função recebe como único parâmetro a classe do Schema.

[Documentação do Typegoose](https://typegoose.github.io/typegoose/)
[Documentação do Mongoose](https://mongoosejs.com/docs/guide.html)

## Subdocumentos
Os subdocumentos são documentos/objetos que são definidos como propriedades de outros documentos. Eles não possuem um Model próprio, visto que serão usados apenas para definir sub-propriedades de alguma propriedade desejada, como no caso de um **endereço** (schema/endereco.schema.ts), que possui logradouro, cep, cidade, dentre outros.

Subdocumentos são **diferentes** de documentos aninhados no âmbito de que subdocumentos possuem a propriedade `_id` por padrão e que não é possível alterar suas propriedades sem que eles estejam criados dentro do documento pai; enquanto documentos aninhados estão sempre presentes, mesmo que vazios, não possuem Schema nem a propriedade `_id`. Para remover esta propriedade dos subdocumentos, basta apenas definir `_id: false`, na propriedade *schemaOptions* do decorator `@modelOptions` da classe do Schema.

## Schema Discriminators
O discriminator é um mecanismo de herança que o Mongoose oferece para criar diferentes coleções a partir de apenas uma, de modo que todas tenham propriedades em comum, porém algumas diferentes entre si, sendo salvas como apenas uma coleção ("tabela").

No Dyon, há dois tipos de usuário: Participante e Instituição. Ambos possuem e-mail e senha, porém o primeiro possui informações pessoais, como cpf, data de nascimento e nome completo; enquanto o segundo, informações empresariais, como nome fantasia, razão social e cnpj. Os discriminators permitem que esses dois tipos de usuário sejam salvos sob uma única coleção, porém sejam distintos entre si, havendo a possibilidade de se registrar um ou outro, usar métodos próprios ou em comum (explicado na próxima seção), buscar todos os tipos de usuário, apenas Participantes, ou apenas Instituições, etc.

É importante ressaltar que para ser definido um novo Schema e Model por meio do discriminator é utilizado `getDiscriminatorModelForClass(BaseModel, Classe)` ao invés de `getModelForClass(Classe)`, onde **Classe** é a classe do novo tipo de coleção e **BaseModel** o modelo da coleção base com as informações em comum.

[Documentação de Discriminator do Typegoose](https://typegoose.github.io/typegoose/docs/guides/advanced/non-nested-discriminators/)

## Definindo métodos estáticos e de instância para Models
É possível definir métodos estáticos ou de instância para os Models para então utilizá-lo como método normal do Model. É útil para executar uma lógica sem redundância no código.

Os **métodos estáticos** tem como primeiro parâmetro `this: ReturnModelType<typeof ClasseDesejada>`. Ex:
```
class Usuario {
    // ...

    static async findByEmail(this: ReturnModelType<typeof Usuario>, email: string) {
        return this.findOne({ email });
    }
}
```

Enquanto para os **métodos de instância**, basta declarar na classe um método que tenha como primeiro parâmetro `this: DocumentType<ClasseDesejada>`. Ex:
```
class Usuario {
    // ...

    async checkPassword(this: DocumentType<Usuario>, password: string) {
        const senhasConferem = bcrypt.compare(password, this.senha);
        return senhasConferem;
    }
}
```

## Envio de E-mails
O envio de e-mails é realizado por meio da classe singleton Email.ts (*email/Email.ts*) com a implementação do Nodemailer. Os métodos públicos lidam apenas com o template desejado, ex: template de cadastro etc.

Os métodos de envio de e-mail retornam **Promise<>** com o retorno do envio de e-mail do nodemailer. Logo, é possível enviá-lo de maneira síncrona com async/await ou assícrona com function chaining ou não. Vale lembrar que **não é verificado** se o endereço do destinatário existe ou não.

Para enviar um e-mail:
```
Email.Instance.metodoDesejado(destinatario, opcoes);
```

## JSDoc
Sendo importante documentar os métodos da API, é possível fazê-lo na norma JSDoc:
- Escrita logo acima do tipo (type, class, interface, function, métodos, etc).
- Estruturada como um comentário, porém começando com dois astericos: \\**
- Parâmetros, propriedades etc devem começar com @
- No VS Code, será exibida ao se passar o mouse acima da implementação.

Exemplo:
```
/**
* Função de criar uma pessoa
* @param nome - string
*/
function criarPessoa(nome: string) {
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
Deve-se separar padrões de objetos (interfaces) e enums (propriedades imutáveis e pré-definidas) nos tipos respectivos. Diretórios:
- **/types/enums**
- **types/interface.ts**

## Fazendo uso do banco de dados
O banco de dados não é local, sendo hospedado em nuvem no MongoDB Atlas. Para que seja permitido seu uso, logo consultas ao banco de dados do Dyon, é necessário adicionar seu IP na allow list.

## Diretório Rest
Nele está contido requisições de teste ou padrão para os documentos do banco de dados, sendo utilizado pela extensão *REST Client* do VS Code.

Para fazer as requisições, basta clicar em "Send Request" acima de cada uma.

## Ajuda
Os imports e exports estão sendo feitos na norma do ES6:
- Importar default: `import pacote from "pacote"`
- Importar objeto: `import * as pacote from "pacote"`
- Import destruct objeto: `import { fun1, fun2, ... } from "pacote"`
- Para exportar default: `export default objeto`
- Para exportar objeto: `export { fun1, fun2, ... }`