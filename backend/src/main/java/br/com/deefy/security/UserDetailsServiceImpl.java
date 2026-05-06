package br.com.deefy.security;

import br.com.deefy.model.Tipo;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
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

        Tipo tipoUsuario = user.getTipoUsuario() == null ? Tipo.USER : user.getTipoUsuario();

        return withUsername(user.getEmail())
                .password(user.getSenha())
                .roles(tipoUsuario.name())
                .build();
    }
}
