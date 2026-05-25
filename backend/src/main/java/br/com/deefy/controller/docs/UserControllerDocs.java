package br.com.deefy.controller.docs;

import br.com.deefy.dto.request.*;
import br.com.deefy.dto.response.AdminUserResponseDTO;
import br.com.deefy.dto.response.AdminUserStatsResponseDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@Tag(name = "User/Profile", description = "Usuários e perfil do usuário autenticado")
public interface UserControllerDocs {

    @Operation(
            summary = "Buscar usuário por ID",
            description = "Retorna os dados públicos de um usuário pelo ID."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuário encontrado com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuário não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> findUserById(Long id);

    @Operation(
            summary = "Buscar meu perfil",
            description = "Retorna os dados do perfil do usuário autenticado pelo JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Perfil retornado com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> getMyProfile(Principal principal);

    @Operation(
            summary = "Atualizar meu nome",
            description = "Atualiza o nome do usuário autenticado pelo JWT."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Nome atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — nome ausente ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> updateMyName(Principal principal, UpdateNameRequestDTO request);

    @Operation(
            summary = "Alterar minha senha",
            description = "Altera a senha do usuário autenticado, exigindo a confirmação da senha atual."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Senha alterada com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — campos ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido, ou senha atual incorreta",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> changeMyPassword(Principal principal, ChangePasswordRequestDTO request);

    @Operation(
            summary = "Atualizar minha foto de perfil (por URL)",
            description = "Salva a URL pública de uma foto de perfil já hospedada para o usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Foto de perfil atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — URL ausente ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> updateMyProfilePhoto(Principal principal, UpdateProfilePhotoRequestDTO request);

    @Operation(
            summary = "Enviar minha foto de perfil (upload)",
            description = "Faz upload de uma imagem para o Storage e salva a URL pública em fotoperfilurl do usuário autenticado."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Foto enviada e perfil atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Arquivo ausente, vazio ou em formato não suportado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "Arquivo excede o tamanho máximo permitido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> uploadMyProfilePhoto(Principal principal, MultipartFile file);

    @Operation(
            summary = "Remover minha foto de perfil",
            description = "Remove a URL da foto de perfil do usuário autenticado, deixando o campo vazio."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Foto removida com sucesso",
                    content = @Content(schema = @Schema(implementation = UserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<UserResponseDTO> removeMyProfilePhoto(Principal principal);

    @Operation(
            summary = "Listar usuários",
            description = "Retorna todos os usuários paginados. Exclusivo para administradores."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Lista de usuários retornada com sucesso",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem listar todos os usuários",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Page<AdminUserResponseDTO>> findAllUsers(Pageable pageable);

    @Operation(
            summary = "Estatísticas administrativas de usuários",
            description = "Retorna dados agregados usados pelo painel admin (total, admins, etc.)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Estatísticas retornadas com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminUserStatsResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem visualizar estatísticas",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminUserStatsResponseDTO> getUserStats();

    @Operation(
            summary = "Atualizar usuário (admin)",
            description = "Atualiza nome, e-mail e role de um usuário quando solicitado pela tela administrativa."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Usuário atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminUserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Erro de validação — dados ausentes ou em formato inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem atualizar usuários",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuário não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — o e-mail informado já está cadastrado por outro usuário",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminUserResponseDTO> updateUser(Long id, AdminUserUpdateRequestDTO requestDTO);

    @Operation(
            summary = "Excluir usuário (admin)",
            description = "Remove o usuário do sistema. A operação pode falhar se houver relacionamentos no banco que impeçam a exclusão."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Usuário excluído com sucesso — nenhum conteúdo retornado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem excluir usuários",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuário não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "Conflito — não foi possível excluir devido a relacionamentos existentes no banco",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<Void> deleteUser(Long id);

    @Operation(
            summary = "Banir/desbanir usuário (admin)",
            description = "Endpoint compatível com o painel admin para gerenciar o status de banimento do usuário."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Status de banimento atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminUserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Operação de banimento ainda não suportada pelo banco de dados",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem banir usuários",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuário não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminUserResponseDTO> setBanStatus(Long id, AdminUserBanRequestDTO requestDTO);

    @Operation(
            summary = "Alterar role do usuário (admin)",
            description = "Atualiza o perfil_id do usuário conforme os perfis existentes no banco (USER ou ADMIN)."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Role atualizada com sucesso",
                    content = @Content(schema = @Schema(implementation = AdminUserResponseDTO.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Role inválida ou perfil correspondente não encontrado no banco",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Não autenticado — token JWT ausente ou inválido",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Acesso negado — apenas administradores podem alterar roles",
                    content = @Content(schema = @Schema(hidden = true))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Usuário não encontrado para o ID informado",
                    content = @Content(schema = @Schema(hidden = true))
            )
    })
    ResponseEntity<AdminUserResponseDTO> setUserRole(Long id, AdminUserRoleRequestDTO requestDTO);
}