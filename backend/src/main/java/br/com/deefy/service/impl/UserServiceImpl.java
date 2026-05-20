package br.com.deefy.service.impl;


import br.com.deefy.dto.request.*;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.exception.EmailJaCadastradoException;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.UserMapper;
import br.com.deefy.model.Tipo;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.UserService;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import br.com.deefy.security.JwtUtil;
import br.com.deefy.service.EmailService;
import br.com.deefy.exception.TokenInvalidoException;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder,
                           EmailService emailService,
                           JwtUtil jwtUtil){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public UserResponseDTO createUser(UserRequestDTO request){

        if(userRepository.existsByEmail(request.email())){
            throw new EmailJaCadastradoException("Email already exists");
        }

        User user = userMapper.toEntity(request);

        user.setNome(request.nome());

        user.setSenha(passwordEncoder.encode(request.senha()));
        user.setTipoUsuario(Tipo.USER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }

    @Override
    public UserResponseDTO findUserById(Long id){
        User user = userRepository.findById(id).orElseThrow(
                () -> new UsuarioNaoEncontradoException("User not found with id: " + id)
        );

        return userMapper.toDTO(user);
    }

    @Override
    public Page<UserResponseDTO> findAllUsers(Pageable pageable) {

        Page<User> usersPage = userRepository.findAll(pageable);

        return usersPage.map(userMapper::toDTO);
    }

    //Removido temporaimente para implementação de um novo mais seguro
    /*
    @Override
    @Transactional
    public UserResponseDTO updateUser(Long id, UpdateUserRequestDTO updateUserRequestDTO){
        User user = userRepository.findById(id).orElseThrow(
                () -> new UsuarioNaoEncontradoException("User not found with id: " + id)
        );

        user.setNome(updateUserRequestDTO.nome());

        if(updateUserRequestDTO.password() != null && !updateUserRequestDTO.password().isBlank()){

            user.setSenha(passwordEncoder.encode(updateUserRequestDTO.password()));
        }

        User savedUser = userRepository.save(user);

        return userMapper.toDTO(savedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id){
        findUserById(id);
        userRepository.deleteById(id);
    }
    */

    @Override
    public UserResponseDTO findProfileByEmail(String email) {
        // Busca o usuário pelo e-mail extraído do JWT
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsuarioNaoEncontradoException("Usuário não encontrado na base de dados.")
        );
        return userMapper.toDTO(user);
    }

    @Override
    @Transactional
    public UserResponseDTO updateMyName(String email, UpdateNameRequestDTO request) {
        //Busca o usuário garantindo que ele existe
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsuarioNaoEncontradoException("Usuário não encontrado na base de dados.")
        );

        user.setNome(request.nome());

        //Salva e converte para DTO
        User savedUser = userRepository.save(user);
        return userMapper.toDTO(savedUser);
    }

    @Override
    public void generatePasswordResetLink(ForgotPasswordRequestDTO request) {
        // 1. Procuramos se o usuário realmente existe na base
        User user = userRepository.findByEmail(request.email()).orElseThrow(
                () -> new UsuarioNaoEncontradoException("Nenhum usuário cadastrado com este e-mail.")
        );

        // 2. Geramos o token stateless temporário contendo o e-mail dele
        String token = jwtUtil.generatePasswordResetToken(user.getEmail());

        // 3. Disparamos o e-mail com o link contendo o token
        emailService.enviarEmailLinkSenha(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequestDTO request) {
        // 1. Verifica a assinatura criptográfica e a expiração do token
        if (!jwtUtil.isPasswordResetTokenValid(request.token())) {
            throw new TokenInvalidoException("O token de redefinição é inválido ou já expirou.");
        }

        // 2. Extrai o e-mail protegido de dentro do token verificado
        String email = jwtUtil.extractEmail(request.token());

        // 3. Localiza o usuário dono do e-mail
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new UsuarioNaoEncontradoException("Usuário associado ao token não foi encontrado.")
        );

        // 4. Criptografa a nova senha informada e atualiza o objeto
        user.setSenha(passwordEncoder.encode(request.novaSenha()));

        // 5. Salva a nova credencial no banco
        userRepository.save(user);
    }
}
