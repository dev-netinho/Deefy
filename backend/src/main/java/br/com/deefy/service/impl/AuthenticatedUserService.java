package br.com.deefy.service.impl;

import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@Component
public class AuthenticatedUserService {

    private final UserRepository userRepository;

    public AuthenticatedUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String getAuthenticatedEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsuarioNaoEncontradoException("Usuário não autenticado");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            return (String) principal;
        } else {
            throw new UsuarioNaoEncontradoException("Usuário autenticado não encontrado");
        }
    }

    @Transactional(readOnly = true)
    public User getAuthenticatedUser() {
        String email = getAuthenticatedEmail();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("User not found with email: " + email));
    }

    public Long getAuthenticatedUserId() {
        return getAuthenticatedUser().getId();
    }
}

