package br.com.deefy.mapper;

import br.com.deefy.dto.request.UserRequestDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.model.User;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    User toEntity(UserRequestDTO userRequestDTO);

    UserResponseDTO toDTO(User user);

    List<UserResponseDTO> toDTOList(List<User> users);

    // User updateToEntity(UpdateUserRequestDTO updateUserRequestDTO);
}

