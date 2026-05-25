package br.com.deefy.controller;

import br.com.deefy.controller.docs.AuthControllerDocs;
import br.com.deefy.dto.request.*;
import br.com.deefy.dto.response.AuthResponseDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.security.JwtUtil;
import br.com.deefy.service.UserService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "Cadastro, login, ativacao de conta e recuperacao de senha")
public class AuthController implements AuthControllerDocs {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserService userService){
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @PostMapping(value = "/login")
    @Operation(summary = "Autenticar usuario", description = "Retorna um JWT para uso no botao Authorize do Swagger.")
    public ResponseEntity<AuthResponseDTO> login(
            @RequestBody
            @Valid AuthRequestDTO request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_USER");

        String token = jwtUtil.generateToken(request.email(), role);

        return ResponseEntity.ok().body(new AuthResponseDTO(token));
    }

    @PostMapping(value = "/register")
    @Operation(summary = "Cadastrar usuario", description = "Cria um cadastro pendente e dispara e-mail de ativacao.")
    public ResponseEntity<UserResponseDTO> register(
            @Valid
            @RequestBody UserRequestDTO dto
    ){
        UserResponseDTO user = userService.createUser(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/v1/users/{id}")
                .buildAndExpand(user.id()).toUri();
        return ResponseEntity.created(uri).body(user);
    }

    @PostMapping("/verify-account")
    @Operation(summary = "Ativar conta", description = "Recebe o token enviado por e-mail e ativa a conta do usuario.")
    public ResponseEntity<Map<String, String>> verifyAccount(@Valid @RequestBody ActivateAccountRequestDTO request) {
        userService.activateAccount(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Conta ativada com sucesso! Você já pode realizar o login.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Solicitar recuperacao de senha", description = "Envia e-mail com link de redefinicao quando o e-mail existir.")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        userService.generatePasswordResetLink(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Se o e-mail estiver correto, você receberá o link de instrução em instantes.");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Redefinir senha", description = "Recebe token de recuperacao e nova senha.")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO request) {
        userService.resetPassword(request);
        return ResponseEntity.noContent().build(); // Retorna 204 após o sucesso
    }
}
