package br.com.deefy.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public class PlaylistRequestDTO {

    @JsonAlias({"nome"})
    @NotBlank(message = "O nome da playlist é obrigatório")
    private String name;

    private boolean publica;

    @JsonAlias({"descricao", "bio"})
    private String description;

    @JsonAlias({"capaUrl", "imageUrl", "imagemUrl"})
    private String coverUrl;

    public String name() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean publica() {
        return publica;
    }

    public void setPublica(boolean publica) {
        this.publica = publica;
    }

    public String description() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String coverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }
}
