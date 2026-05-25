package br.com.deefy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI deefyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Deefy API")
                        .version("1.0.0")
                        .description("""
                                Documentacao navegavel da API Deefy - plataforma de streaming de musica.

                                Fluxo de autenticacao:
                                1. Use POST /api/v1/auth/register para criar uma conta.
                                2. Verifique a conta via POST /api/v1/auth/verify-account.
                                3. Use POST /api/v1/auth/login para obter o JWT.
                                4. Clique em Authorize no Swagger.
                                5. Informe o token no formato: Bearer <token>.

                                Modulos disponiveis:
                                - Autenticacao, usuarios e perfil
                                - Musicas, artistas, generos e albuns compativeis
                                - Playlists pessoais e globais
                                - Favoritos de musicas, artistas e generos
                                - Historico de escuta
                                - Storage de imagem/audio
                                - Importacao administrativa de playlists do YouTube
                                """)
                        .contact(new Contact()
                                .name("Equipe Deefy")
                                .email("deefy.business@gmail.com"))
                        .license(new License().name("Projeto academico")))
                .addServersItem(new Server()
                        .url("https://deefy.olua.me")
                        .description("Producao/Staging publica"))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Backend local"))
                .tags(List.of(
                        new Tag().name("Autenticacao"),
                        new Tag().name("User/Profile"),
                        new Tag().name("Music"),
                        new Tag().name("Artists"),
                        new Tag().name("Genres"),
                        new Tag().name("Albums"),
                        new Tag().name("Playlist"),
                        new Tag().name("Favorites"),
                        new Tag().name("History"),
                        new Tag().name("Storage"),
                        new Tag().name("Admin Playlist Import")
                ))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
