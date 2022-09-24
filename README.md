# Back-End Dyon
API da aplicação Dyon, consumida pelo front-end desenvolvido em React.

## Executar
Para compilar, executar e observar, digitar no terminal: `npm run dev`
	
## Pacotes
- Express
- Cors
- TS-Node-Dev
- Dotenv

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
interface exemple {
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
  

## Ajuda
- Os imports e exports estão sendo feitos na norma do ES6:
- Importar default: `import pacote from "pacote"`
- Importar objeto: `import * as pacote from "pacote"`
- Import destruct objeto: `import { fun1, fun2, ... } from "pacote"`
- Para exportar default: `export default objeto`
- Para exportar objeto: `export { fun1, fun2, ... }`