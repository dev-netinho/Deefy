package br.com.deefy.service.impl;


import br.com.deefy.dto.UpdateUserRequestDTO;
import br.com.deefy.dto.request.UserRequestDTO;
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

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
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
}
