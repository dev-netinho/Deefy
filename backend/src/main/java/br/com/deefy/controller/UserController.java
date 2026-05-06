package br.com.deefy.controller;

import br.com.deefy.dto.UpdateUserRequestDTO;
import br.com.deefy.dto.response.UserResponseDTO;
import br.com.deefy.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<UserResponseDTO> findUserById(
            @PathVariable Long id
    ) {
        UserResponseDTO user = userService.findUserById(id);
        return ResponseEntity.ok().body(user);
    }

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> findAllUsers(
            @PageableDefault(size = 5, sort = "id")
            Pageable pageable
    ){
        Page<UserResponseDTO> listAllUsers = userService.findAllUsers(pageable);
        return ResponseEntity.ok().body(listAllUsers);
    }

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
}
