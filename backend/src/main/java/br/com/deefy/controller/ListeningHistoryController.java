package br.com.deefy.controller;

import br.com.deefy.config.OpenApiConfig;
import br.com.deefy.controller.docs.ListeningHistoryControllerDocs;
import br.com.deefy.dto.request.ListeningHistoryRequest;
import br.com.deefy.dto.request.ListeningHistoryResponse;
import br.com.deefy.service.ListeningHistoryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/history")
@Tag(name = "History", description = "Historico de musicas do usuario autenticado")
@SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
public class ListeningHistoryController implements ListeningHistoryControllerDocs {

    private final ListeningHistoryService listeningHistoryService;

    public ListeningHistoryController(ListeningHistoryService listeningHistoryService) {
        this.listeningHistoryService = listeningHistoryService;
    }

    @PostMapping
    public ResponseEntity<ListeningHistoryResponse> save(@Valid @RequestBody ListeningHistoryRequest request) {
        return ResponseEntity.ok().body(listeningHistoryService.saveListeningHistory(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Page<ListeningHistoryResponse>> findAll(@PathVariable Long id, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(listeningHistoryService.getHistoryByUserId(id, pageable));
    }
}
