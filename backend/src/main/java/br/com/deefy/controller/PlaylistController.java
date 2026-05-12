package br.com.deefy.controller;

import br.com.deefy.dto.request.PlaylistRequestDTO;
import br.com.deefy.dto.response.PlaylistResponseDTO;
import br.com.deefy.exception.UsuarioNaoEncontradoException;
import br.com.deefy.mapper.PlaylistMapper;
import br.com.deefy.model.Playlist;
import br.com.deefy.model.User;
import br.com.deefy.repository.UserRepository;
import br.com.deefy.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @Autowired
    private PlaylistMapper playlistMapper;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    public ResponseEntity<PlaylistResponseDTO> create(
            @RequestBody PlaylistRequestDTO request,
            @AuthenticationPrincipal Object principal) { // Usamos Object para evitar o erro de Cast

        String email;

        // Lógica para extrair o email independente de como o Spring guardou o usuário
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = principal.toString();
        }

        // Agora buscamos o SEU usuário do banco pelo email para ter o ID real e o objeto completo
        User owner = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado com o email: " + email));

        // Criamos a entidade Playlist a partir do DTO
        Playlist newPlaylist = new Playlist();
        newPlaylist.setName(request.name());
        newPlaylist.setPublica(request.publica());

        // Chamamos o service passando o ID do dono que acabamos de buscar
        Playlist saved = playlistService.createPlaylist(newPlaylist, owner.getId());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(playlistMapper.toResponseDTO(saved));
    }

    // Listar todas as playlists do usuário logado
    @GetMapping
    public ResponseEntity<List<PlaylistResponseDTO>> listAll(@AuthenticationPrincipal Object principal) {
        String email;

        // O log diz que o 'principal' é um User do Spring Security
        if (principal instanceof org.springframework.security.core.userdetails.User springUser) {
            email = springUser.getUsername();
        } else if (principal instanceof String s) {
            email = s;
        } else {
            throw new RuntimeException("Não foi possível identificar o usuário logado.");
        }

        // Agora buscamos o SEU usuário do banco pelo email para ter o ID real
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));

        List<Playlist> playlists = playlistService.findAllByOwner(user.getId());

        return ResponseEntity.ok(playlists.stream()
                .map(playlistMapper::toResponseDTO)
                .toList());
    }

    // Visualizar uma playlist específica
    @GetMapping("/{id}")
    public ResponseEntity<PlaylistResponseDTO> findById(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        Playlist playlist = playlistService.findById(id, user.getId());
        return ResponseEntity.ok(playlistMapper.toResponseDTO(playlist));
    }

    // Adicionar uma música à playlist
    @PostMapping("/{playlistId}/tracks/{musicId}")
    public ResponseEntity<PlaylistResponseDTO> addMusic(
            @PathVariable Long playlistId,
            @PathVariable Long musicId,
            @AuthenticationPrincipal Object principal) {

        String email = extrairEmail(principal);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));

        // O service agora recebe o objeto User ou o ID dele para validar a posse
        Playlist updated = playlistService.addMusicToPlaylist(playlistId, musicId, user.getId());
        return ResponseEntity.ok(playlistMapper.toResponseDTO(updated));
    }

    @DeleteMapping("/{playlistId}/tracks/{musicId}")
    public ResponseEntity<Void> removeMusic(
            @PathVariable Long playlistId,
            @PathVariable Long musicId,
            @AuthenticationPrincipal Object principal) {

        String email = extrairEmail(principal);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));

        playlistService.removeMusicFromPlaylist(playlistId, musicId, user.getId());
        return ResponseEntity.noContent().build();
    }

    // Metodo auxiliar para evitar repetição de código
    private String extrairEmail(Object principal) {
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            return userDetails.getUsername();
        }
        return principal.toString();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlaylistResponseDTO> update(
            @PathVariable Long id,
            @RequestBody PlaylistRequestDTO request,
            @AuthenticationPrincipal Object principal) {

        String email = extrairEmail(principal);
        User user = userRepository.findByEmail(email).orElseThrow();

        // Passamos o ID da playlist, o DTO com o novo Nnome e o ID do dono
        Playlist updated = playlistService.updateName(id, request, user.getId());

        return ResponseEntity.ok(playlistMapper.toResponseDTO(updated));
    }

    // Excluir uma playlist
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Object principal) {
        String email;

        // Extrai o email do principal (seja String ou UserDetails)
        if (principal instanceof org.springframework.security.core.userdetails.UserDetails userDetails) {
            email = userDetails.getUsername();
        } else {
            email = principal.toString();
        }

        // Busca o seu usuário para validar o ID
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNaoEncontradoException("Usuário não encontrado"));

        // Passa o ID da playlist e o ID do dono para o Service
        playlistService.deletePlaylist(id, user.getId());

        return ResponseEntity.noContent().build();
    }
}