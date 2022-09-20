# Back-End Dyon

## Executar
Para compilar, executar e observar, digitar no terminal: `npm run dev`

## Pacotes
- Express
- Cors
- TS-Node-Dev
- Dotenv

## Variáveis de Ambiente
As variáveis de ambiente são salvas no arquivo .ENV. Para acessar deve-se utilizar:
`process.env.NOME_VAR`.

## Ajuda
- Os imports estão sendo feitos na norma do ES6:
    - Importar default: `import pacote from "pacote"`
    - Importar objeto:  `import * as pacote from "pacote"`
    - Import destruct objeto: `import { fun1, fun2, ... } from "pacote"`
    - Para exportar default: `export default objeto`
    - Para exportar objeto: `export { fun1, fun2, ... }`