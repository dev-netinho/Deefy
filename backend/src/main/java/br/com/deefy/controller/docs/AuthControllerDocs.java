package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.*;
import br.com.deefy.dto.response.AuthResponseDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tag(name = "Autenticação", description = "Cadastro, login, ativação de conta e recuperação de senha")
public interface AuthControllerDocs {

    @Operation(
            summary = "Autenticar usuário",
            description = "Valida as credenciais do usuário e retorna um token JWT para acesso às rotas protegidas."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Login realizado com sucesso — token JWT retornado no corpo da resposta",
                    content = @Content(schema = @Schema(implementation = AuthResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — e-mail ou senha em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Credenciais inválidas — e-mail ou senha incorretos",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Conta ainda não ativada — o usuário precisa verificar o e-mail antes de fazer login",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AuthResponseDTO> login(AuthRequestDTO request);

    @Operation(
            summary = "Registrar novo usuário",
            description = "Cria uma nova conta de usuário no sistema com a permissão padrão USER. " +
                    "Após o registro, um e-mail de ativação é enviado automaticamente."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Usuário registrado com sucesso — URI do novo recurso retornada no header Location",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — dados enviados estão ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — já existe um usuário cadastrado com este e-mail",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> register(UserRequestDTO dto);

    @Operation(
            summary = "Ativar conta",
            description = "Recebe o token enviado por e-mail e ativa a conta do usuário, " +
                    "liberando o acesso ao sistema."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Conta ativada com sucesso — usuário já pode realizar o login",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — token ausente ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Token não encontrado ou já utilizado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "410",
                    description = "Token expirado — o prazo de ativação foi ultrapassado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Map<String, String>> verifyAccount(ActivateAccountRequestDTO request);

    @Operation(
            summary = "Solicitar recuperação de senha",
            description = "Envia um e-mail com o link de redefinição de senha quando o endereço informado " +
                    "estiver cadastrado. Por segurança, a resposta é sempre a mesma independentemente de o " +
                    "e-mail existir ou não."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Solicitação processada — se o e-mail existir, o link será enviado em instantes",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — e-mail ausente ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "429",
                    description = "Muitas solicitações — aguarde antes de tentar novamente",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Map<String, String>> forgotPassword(ForgotPasswordRequestDTO request);

    @Operation(
            summary = "Redefinir senha",
            description = "Recebe o token de recuperação (enviado por e-mail) e a nova senha escolhida pelo usuário, " +
                    "atualizando as credenciais de acesso."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Senha redefinida com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — token ou nova senha ausentes/inválidos",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Token não encontrado ou já utilizado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "410",
                    description = "Token expirado — solicite um novo link de recuperação",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> resetPassword(ResetPasswordRequestDTO request);
}