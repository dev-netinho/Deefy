package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.dto.request.ChangePasswordRequestDTO;
import br.com.deefy.dto.request.UpdateNameRequestDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;

@RestController
@RequestMapping(value = "/api/v1/users")
@Tag(name = "User/Profile", description = "Usuarios e perfil do usuario autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping(value = "/{id}")
    @Operation(summary = "Buscar usuario por ID", description = "Retorna os dados publicos de um usuario pelo ID.")
    public ResponseEntity<UserResponseDTO> findUserById(
            @PathVariable Long id
    ) {
        UserResponseDTO user = userService.findUserById(id);
        return ResponseEntity.ok().body(user);
    }

    @GetMapping
    @Operation(summary = "Listar usuarios", description = "Retorna usuarios paginados.")
    public ResponseEntity<Page<UserResponseDTO>> findAllUsers(
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ){
        Page<UserResponseDTO> listAllUsers = userService.findAllUsers(pageable);
        return ResponseEntity.ok().body(listAllUsers);
    }

    /*
    @PutMapping(value = "/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @Valid
            @RequestBody UpdateUserRequestDTO requestDTO
    ){
        UserResponseDTO user = userService.updateUser(id, requestDTO);
        return ResponseEntity.ok().body(user);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id
    ){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
    */


    @GetMapping(value = "/me")
    @Operation(summary = "Buscar meu perfil", description = "Retorna o perfil do usuario autenticado pelo JWT.")
    public ResponseEntity<UserResponseDTO> getMyProfile(Principal principal) {
        // principal.getName() retorna o "username" do JWT, que no nosso caso é o e-mail.
        String email = principal.getName();
        UserResponseDTO profile = userService.findProfileByEmail(email);
        return ResponseEntity.ok(profile);
    }

    @PatchMapping(value = "/me/name")
    @Operation(summary = "Atualizar meu nome", description = "Atualiza o nome do usuario autenticado pelo JWT.")
    public ResponseEntity<UserResponseDTO> updateMyName(
            Principal principal,
            @Valid @RequestBody UpdateNameRequestDTO request) {

        String email = principal.getName();
        UserResponseDTO updatedProfile = userService.updateMyName(email, request);
        return ResponseEntity.ok(updatedProfile);
    }

    @PatchMapping(value = "/me/password")
    @Operation(summary = "Alterar minha senha", description = "Altera a senha do usuario autenticado validando a senha atual.")
    public ResponseEntity<Void> changeMyPassword(
            Principal principal,
            @Valid @RequestBody ChangePasswordRequestDTO request) {

        String email = principal.getName();
        userService.changeMyPassword(email, request);
        return ResponseEntity.noContent().build();
    }
}
