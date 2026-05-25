package br.com.deefy.mapper;

import br.com.deefy.dto.request.UserRequestDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.model.User;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-20T18:06:21-0300",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.11 (Microsoft)"
)
@Component
public class UserMapperImpl implements UserMapper {

    @Override
    public User toEntity(UserRequestDTO userRequestDTO) {
        if ( userRequestDTO == null ) {
            return null;
        }

        User user = new User();

        user.setNome( userRequestDTO.nome() );
        user.setEmail( userRequestDTO.email() );
        user.setSenha( userRequestDTO.senha() );

        return user;
    }

    @Override
    public UserResponseDTO toDTO(User user) {
        if ( user == null ) {
            return null;
        }

        Long id = null;
        String nome = null;
        String email = null;
        LocalDateTime createdAt = null;

        id = user.getId();
        nome = user.getNome();
        email = user.getEmail();
        createdAt = user.getCreatedAt();

        UserResponseDTO userResponseDTO = new UserResponseDTO( id, nome, email, createdAt );

        return userResponseDTO;
    }

    @Override
    public List<UserResponseDTO> toDTOList(List<User> users) {
        if ( users == null ) {
            return null;
        }

        List<UserResponseDTO> list = new ArrayList<UserResponseDTO>( users.size() );
        for ( User user : users ) {
            list.add( toDTO( user ) );
        }

        return list;
    }
}
