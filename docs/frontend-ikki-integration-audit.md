# Auditoria da integracao do front do Ikki

## Fonte integrada

- Repositorio origem: `https://github.com/vitoria-ribas/deefy`
- Branch origem: `grupo4-front`
- Commit integrado: `63d48e317cd659cd96fd9ffeeaea34c8af26a7a5`
- Mensagem do commit: `feat: add dev bypass button to Welcome page and update search UI to trigger instantly on raw input`

## Como a integracao foi feita

A branch externa esta organizada dentro da pasta `client/`. No repositorio oficial, o front vive em `frontend/`.

Por isso a integracao foi feita mapeando:

```txt
vitoria-ribas/deefy:client/ -> dev-netinho/Deefy:frontend/
```

Arquivos preservados do nosso repositorio oficial:

- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/.env.example`
- `frontend/public/docs-api.html`

Motivo:

- `Dockerfile` e `nginx.conf` fazem parte do deploy atual na VPS.
- `.env.example` documenta a configuracao local do time.
- `docs-api.html` e a documentacao publica da API em producao.

## Principais mudancas vindas do commit do front

- Nova home responsiva com sidebar, header, busca, secoes em destaque e lista de musicas mockadas.
- Novos componentes em `frontend/src/components/`.
- Novos hooks em `frontend/src/hooks/`.
- Mock de musicas/playlists em `frontend/src/mocks/musicData.js`.
- Troca visual dos toasts para `sonner`.
- Estados de loading em login/cadastro.
- Busca da home recalculando com debounce, mas abrindo estado visual de busca imediatamente quando o usuario digita.

## Linhas alteradas manualmente para integrar com o backend oficial

### 1. `frontend/src/services/api.js`

Linha mantida/adaptada:

```js
baseURL: import.meta.env.VITE_API_URL || '',
```

Motivo:

O front externo usava fallback `http://localhost:3000`. Isso quebraria producao, porque em producao as chamadas devem ser relativas ao mesmo dominio (`https://deefy.olua.me`) e o path `/api/v1/...` e roteado pelo Traefik para o backend.

Resultado:

- Local: o time pode usar `VITE_API_URL=https://deefy.olua.me`.
- Producao: se `VITE_API_URL` nao existir no build, o browser usa o proprio dominio atual.

### 2. `frontend/src/pages/Login.jsx`

Linha ajustada:

```js
const response = await api.post("/api/v1/auth/login", { email, senha: password });
```

Motivo:

O backend oficial espera o campo `senha`, nao `password`.

Linha ajustada:

```js
navigate("/home");
```

Motivo:

A rota protegida da tela principal e `/home`. Navegar para `/` voltaria para a tela `Welcome`.

Linha ajustada:

```js
const errorMessage = err.data?.message || err.data?.error || err.message || "Erro de conexao ao palco. Tente novamente.";
```

Motivo:

O interceptor de `api.js` rejeita um objeto padronizado com `data` e `message`, nao necessariamente `err.response`. Sem isso, erros reais do backend poderiam cair em mensagem generica.

### 3. `frontend/src/pages/Registration.jsx`

Payload ajustado:

```js
const response = await api.post("/api/v1/auth/register", {
  nome: fullName,
  email,
  senha: password
});
```

Motivo:

O backend oficial espera `nome` e `senha`, nao `name` e `password`.

Linha ajustada:

```js
navigate("/home");
```

Motivo:

Se no futuro o cadastro retornar token, o usuario ja deve ir para a home autenticada. Hoje o backend oficial retorna usuario criado, entao o fluxo normal ainda cai em `navigate("/login")`.

Linha ajustada:

```js
const errorMessage = err.data?.message || err.data?.error || err.message || "Erro nos bastidores ao tentar criar conta.";
```

Motivo:

Mesmo motivo do login: compatibilizar com o interceptor de erro do `api.js`.

Linha ajustada para lint:

```js
} catch {
```

Motivo:

O `catch (e)` tinha variavel nao utilizada e quebrava `npm run lint`.

### 4. `frontend/src/main.jsx` e `frontend/src/components/ProtectedRoute.jsx`

Foi criado:

```js
import { Navigate } from 'react-router-dom'
import { isAuthenticated } from '../utils/auth.js'

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
```

E o `main.jsx` passou a importar:

```js
import ProtectedRoute from './components/ProtectedRoute.jsx'
```

Motivo:

O lint do React Fast Refresh acusa erro quando um arquivo como `main.jsx` declara componente local. Mover `ProtectedRoute` para componente separado limpa o lint e preserva o comportamento.

### 5. `frontend/src/pages/home.jsx`

Linha ajustada:

```js
const { results, isEmpty } = useMusicSearch(MOCK_SONGS, debouncedQuery);
```

Motivo:

`sanitizedQuery` era retornado pelo hook, mas nao era usado. Isso quebrava `npm run lint`.

## Validacoes executadas

```bash
npm ci
npm run lint
npm run build
```

Resultado:

- `npm run lint`: passou.
- `npm run build`: passou.
- Observacao: `npm ci` mostrou aviso de engine para `@rolldown/plugin-babel`, porque ele pede Node `>=22.12.0 || ^24.0.0`, enquanto o ambiente local esta com Node `20.20.2`. Mesmo assim a instalacao e o build passaram.
- Observacao: `npm ci` reportou `1 high severity vulnerability` via `npm audit`; nao rodei `npm audit fix` para nao alterar dependencias automaticamente fora do escopo do commit do front.
