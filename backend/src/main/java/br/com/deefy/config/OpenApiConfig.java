package br.com.deefy.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
                                Documentacao navegavel da API Deefy.

                                Fluxo de teste recomendado:
                                1. Use POST /api/v1/auth/login para obter o JWT.
                                2. Clique em Authorize no Swagger.
                                3. Informe o token no formato: Bearer <token>.

                                Modulos ainda sem endpoint publico na staging atual:
                                Favorites, Rating e History.
                                """)
                        .license(new License().name("Projeto academico")))
                .addServersItem(new Server()
                        .url("https://deefy.olua.me")
                        .description("Producao/Staging publica"))
                .addServersItem(new Server()
                        .url("http://localhost:8080")
                        .description("Backend local"))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name("Authorization")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}
