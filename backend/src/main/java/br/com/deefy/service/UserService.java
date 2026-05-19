package br.com.deefy.service;

import br.com.deefy.dto.request.*;
import br.com.deefy.dto.response.UserResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponseDTO createUser(UserRequestDTO request);

    UserResponseDTO findUserById(Long id);

    Page<UserResponseDTO> findAllUsers(Pageable pageable);

    //UserResponseDTO updateUser(Long id, UpdateUserRequestDTO updateUserRequestDTO);

    //void deleteUser(Long id);

    UserResponseDTO findProfileByEmail(String email);

    UserResponseDTO updateMyName(String email, UpdateNameRequestDTO request);

    void generatePasswordResetLink(ForgotPasswordRequestDTO request);

    void resetPassword(ResetPasswordRequestDTO request);
}
