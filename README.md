# Back-End Dyon
API da aplicação Dyon desenvolvida em Typescript com Express e MongoDB, consumida pelo front-end desenvolvido em React.

## Utilização
Para executar em qualquer ambiente, primeiro instalar as dependências com `npm i` na raiz da solução.

### Execução em desenvolvimento
Para execução com hot refresh do código typescript, utilizar o comando: `npm run dev`.

### Compilação e Execução
Para compilar o código, utilizar o comando `npm run build`. O código javascript final será gerado na pasta **build** na raiz da solução.

Para executar o código gerado, utilizar o comando `npm run start`.

## Dependências principais
- Express
- Mongoose
- Nano ID
- Cookie Parser
- jsonwebtoken
- TS-Node-Dev
- Bcrypt
- EJS

## Variáveis de Ambiente
As variáveis de ambiente são salvas no arquivo **.ENV**. No repositório há o arquivo **.ENV.TEMPLATE** com as variáveis necessárias para o funcionamento do sistema:
- `PORT`: porta do endereço da API.
- `DB_PASS`: senha do banco de dados.
- `DB_DEV`: string de conexão do banco de dados MongoDB.

- `EMAIL_USER`: email a ser utilizado pelo Nodemailer
- `EMAIL_PASS`: senha do email
- `REFRESH_TOKEN_SECRET`: string para geração dos JWT de Refresh Token
- `ACCESS_TOKEN_SECRET`: string para geração dos JWT de Access Token
- `ACCESS_TOKEN_EXPIRATION`: tempo de expiração em linguagem natural de acordo com a [dependência ms](https://www.npmjs.com/package/ms).

## Rotas da API e Controllers
A lógica/regras de negócio são separadas da declaração das rotas e seus métodos HTTP.

Desta maneira, as rotas da API estão localizadas no diretório **routes/** e mapeadas no arquivo **router.ts** no mesmo diretório.

E a lógica, por sua vez, no diretório **controllers**. Cada rota possui uma controller, que é definida como uma classe com métodos estáticos.

## Autenticação
Ao fazer login, o usuário deve poder se manter autenticado, logo será retornado dois tokens para ele:
- **Refresh Token**: mantém a sessão do usuário.
  - Possui duração de 1 mês.
  - Deve ser salvo nos cookies e configurado da seguinte maneira: `{ httpOnly: true, secure: true, sameSite: ”None” }`.
- **Access Token**: utilizado em conjunto do refresh token para permitir o acesso à rotas e recursos protegidos. A cada requisição à rotas protegidas da API é verificado se não foi expirado, e caso tenha sido, é gerado um novo.
  - Possui duração de 5 minutos.
  - É utilizado no header “Authorization”, com Bearer, das requisições.

Para acessar rotas protegidas, é verificado o **Access Token**. Caso tenha sido expirado e a requisição possua um Refresh Token em seus cookies, é gerado e retornado um novo Access Token. Isso garante que caso o Access Token seja roubado, ele não possa mais ser utilizado após um curto período de tempo. Além disso, sem o Refresh Token ou com um que seja inválido, não serão gerados mais Access Tokens.

- Os tokens são gerados com hashes no padrão JWT.
- No caso da biblioteca utilizada (jsonwebtoken), deve ser informado apenas o payload, o secret e opções da signature.
  - Payload: objeto com os dados desejados. No caso, apenas o id do usuário. ex: { id: user._id }.
  - Opções da signature: tempo de expiração, etc.

Para fazer que seja necessário a autenticação em alguma rota ou grupo de rotas, deve-se utilizar o middleware **authAccessToken.middleware.ts** como callback do router ou uma rota em específico: `router.use(authAccessToken)` ou `router.route(" ... ").get(authAccessToken, handler)`.

Abaixo estão listadas as rotas de autorização

### /auth/login
Realiza login

### /auth/logout
Realiza logout

- Necessita de cookie nomeado "*token*" contendo um Refresh Token válido.

### /auth/token
Gera novo Access Token
- Necessita de cookie nomeado "*token*" contendo um Refresh Token válido.

## Envio de E-mails
O envio de e-mails é realizado por meio da classe singleton Email.ts (*email/Email.ts*) com a implementação do Nodemailer. Os métodos públicos lidam apenas com o template desejado, ex: template de cadastro etc.

Os métodos de envio de e-mail retornam **Promise<>** com o retorno do envio de e-mail do nodemailer. Logo, é possível enviá-lo de maneira síncrona com async/await ou assícrona com function chaining ou não. Vale lembrar que **não é verificado** se o endereço do destinatário existe ou não.

Para enviar um e-mail:
```
Email.Instance.metodoDesejado(destinatario, opcoes);
```