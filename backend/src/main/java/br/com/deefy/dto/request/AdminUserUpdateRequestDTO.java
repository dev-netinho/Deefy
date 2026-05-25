package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

public record AdminUserUpdateRequestDTO(
        @JsonAlias("nome")
        String name,

        String email,

        String username,

        String role
) {
}
