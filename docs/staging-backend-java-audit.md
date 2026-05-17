# Auditoria das alteracoes Java na branch staging

## Escopo

Este documento registra as alteracoes em codigo Java feitas para integrar a branch `staging` ao schema oficial atual e ao uso publico da API.

Comparacao principal de autoria tecnica: `7d63466..origin/staging` em `backend/src/main/java`.

O objetivo deste documento e dar rastreabilidade para o time de backend: o que foi alterado, por que foi alterado e o que ainda precisa virar implementacao oficial do time.

## O que nao foi alterado por nos

Os arquivos de playlist vieram do trabalho do time/backend, incluindo Gustavo:

- `backend/src/main/java/br/com/deefy/exception/PlaylistException.java`
- `backend/src/main/java/br/com/deefy/model/Playlist.java`
- `backend/src/main/java/br/com/deefy/repository/PlaylistRepository.java`
- `backend/src/main/java/br/com/deefy/service/PlaylistService.java`
- `backend/src/main/java/br/com/deefy/service/impl/PlaylistServiceImpl.java`

Eles nao foram reescritos na branch `staging`. O que existe hoje nesses arquivos deve ser tratado como codigo recebido do time, ainda que tenha pontos incompletos.

## Alteracoes Java feitas para a staging

### 1. `MusicNotFoundException.java`

Arquivo criado:

```java
package br.com.deefy.exception;

public class MusicNotFoundException extends RuntimeException {

    public MusicNotFoundException(Long musicId) {
        super("Music not found with id: " + musicId);
    }
}
```

Motivo:

O service de historico de execucao precisa buscar uma musica antes de gravar o historico. Quando o `musica_id` enviado nao existe, o backend precisava de uma excecao especifica para deixar claro que a falha e na referencia da musica.

Impacto:

- Nao muda o banco.
- Nao muda controller.
- Apenas permite que `ListeningHistoryServiceImpl` compile e trate musica inexistente com erro especifico.

### 2. `ListeningHistory.java`

Linha alterada:

```diff
- @Column(name = "data_hora_execucao", nullable = false)
+ @Column(name = "datahoraexecucao", nullable = false)
```

Motivo:

O schema oficial define `dataHoraExecucao` sem aspas:

```sql
dataHoraExecucao TIMESTAMP NOT NULL
```

No PostgreSQL, nomes sem aspas sao normalizados para minusculo. Na pratica, a coluna criada vira `datahoraexecucao`. Por isso o mapeamento JPA precisou apontar para `datahoraexecucao`, e nao para `data_hora_execucao`.

Impacto:

- Faz o JPA encontrar a coluna real criada pelo PostgreSQL.
- Nao altera a estrutura do banco.
- Recomenda-se que o time de banco padronize nomes em `snake_case` ou tudo minusculo para evitar esse tipo de confusao.

### 3. `User.java`

Linhas alteradas:

```diff
- @Enumerated
- @Column(name = "tipo_usuario")
+ @Transient
  private Tipo tipoUsuario;

- @Column(name = "created_at")
+ @Transient
  private LocalDateTime createdAt;
```

Motivo:

O schema oficial da tabela `USUARIO` possui apenas:

```sql
id
nome
email
senha
perfil_id
```

As colunas `tipo_usuario` e `created_at` nao existem no schema atual. Se esses campos continuassem persistidos por JPA, o backend poderia quebrar ao carregar/salvar usuario dependendo da validacao do Hibernate e das queries geradas.

Por isso os campos foram marcados como `@Transient`: continuam existindo no objeto Java para nao quebrar codigo que ainda chama getters/setters, mas deixam de ser persistidos no PostgreSQL.

Impacto:

- Evita mismatch entre entidade Java e schema oficial.
- Nao adiciona coluna no banco.
- `createdAt` pode aparecer no retorno logo apos cadastro porque o Java seta o valor em memoria, mas nao fica salvo no banco.
- A regra definitiva de perfil/permissao deve vir de `PERFIL`/`ADMINISTRADOR` ou o time de banco deve oficializar outra coluna.

### 4. `MusicRepository.java`

Arquivo criado:

```java
package br.com.deefy.repository;

import br.com.deefy.model.Music;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MusicRepository extends JpaRepository<Music, Long> {
}
```

Motivo:

`ListeningHistoryServiceImpl` usa `MusicRepository` para validar se a musica existe antes de gravar historico. A classe de repository ainda nao existia na branch, entao o projeto nao ficava completo para esse fluxo.

Impacto:

- Nao cria endpoint novo.
- Nao muda schema.
- Apenas expoe o acesso JPA basico para a entidade `Music`.

### 5. `ListeningHistoryServiceImpl.java`

Imports adicionados:

```diff
+ import br.com.deefy.exception.MusicNotFoundException;
+ import br.com.deefy.repository.MusicRepository;
```

Motivo:

O service ja precisava validar musica por id. Esses imports completam a dependencia com a exception e o repository criados.

Impacto:

- Completa a compilacao do modulo de historico.
- O modulo ainda nao esta exposto por controller na `staging`.

### 6. `SecurityConfig.java`

Alteracao feita para liberar CORS de forma configuravel:

```java
@Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,https://deefy.olua.me}") String allowedOrigins
```

```java
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(parseAllowedOrigins());
    configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin"));
    configuration.setExposedHeaders(List.of("Location"));
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", configuration);
    return source;
}
```

Motivo:

A API publica respondia via cURL, mas o navegador bloqueava o frontend local em `localhost:5173` por CORS. Sem isso, o time de frontend nao conseguiria testar localmente contra `https://deefy.olua.me/api/v1`.

Impacto:

- Permite testes locais do frontend em Vite.
- Nao altera banco.
- Nao altera regra de autenticacao JWT.
- A lista de origens pode ser ajustada por variavel `APP_CORS_ALLOWED_ORIGINS`.

## Pontos incompletos que precisam virar tarefa oficial

- `PlaylistServiceImpl` ainda tem comentarios indicando que faltam `UserRepository` e `MusicRepository` para associar entidades de verdade.
- Nao existe `PlaylistController` oficial na `staging`, entao o frontend ainda nao tem API publica de playlist nessa branch.
- Existem DTOs/services de historico, mas nao existe `ListeningHistoryController` oficial na `staging`.
- Existem modelos `Artist`, `Album`, `Music` e `MusicRating`, mas nao existem controllers/services completos oficiais para catalogo musical.
- O modelo `Music` ainda esta alinhado parcialmente ao modelo antigo: ele possui `deezerId` e nao possui `arquivoUrl`, mesmo que o `schema_atualizado.sql` tenha removido `deezerId` e tornado `MUSICA.arquivoUrl` obrigatorio.
- `MusicRating` referencia a ideia de avaliacao, mas a tabela `AVALIACAO` nao existe no `schema_atualizado.sql`.
- `ADMINISTRADOR` existe no schema, mas nao existe modulo Java oficial dedicado a admin na `staging`.

## Resumo para explicar ao time

As alteracoes feitas na `staging` nao foram para substituir o codigo dos criadores. Elas foram patches de alinhamento para o backend parar de esperar colunas que o banco oficial nao tem, completar dependencias que o proprio service ja exigia e liberar CORS para o frontend testar a API publica localmente. O CRUD de playlist recebido do time nao foi refeito; ele apenas precisa de uma proxima etapa oficial para controller, DTOs, associacao real com usuario/musica e regras de permissao.
