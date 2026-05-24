package br.com.deefy.security;

import br.com.deefy.model.Tipo;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Locale;

import static org.springframework.security.core.userdetails.User.withUsername;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with this email: " + email));

        return withUsername(user.getEmail())
                .password(user.getSenha())
                .authorities(resolveAuthority(user))
                .build();
    }

    private String resolveAuthority(User user) {
        if (user.getTipoUsuario() == Tipo.ADMIN) {
            return "ROLE_ADMIN";
        }

        String perfilNome = user.getPerfil() == null ? "" : user.getPerfil().getNome();
        String normalizedPerfil = perfilNome.toUpperCase(Locale.ROOT);

        if (normalizedPerfil.contains("ADMIN")) {
            return "ROLE_ADMIN";
        }

        return "ROLE_USER";
    }
}
