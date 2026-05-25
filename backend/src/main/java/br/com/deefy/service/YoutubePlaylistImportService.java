package br.com.deefy.service;

import br.com.deefy.dto.request.YoutubePlaylistImportRequestDTO;
import br.com.deefy.dto.response.YoutubeCookiesStatusResponseDTO;
import br.com.deefy.dto.response.YoutubePlaylistImportJobResponseDTO;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Set;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class YoutubePlaylistImportService {

    private static final int OUTPUT_LIMIT = 400;
    private static final String DEFAULT_COOKIES_PATH = "/app/secrets/youtube-cookies.txt";
    private final Map<String, ImportJob> jobs = new ConcurrentHashMap<>();

    public YoutubePlaylistImportJobResponseDTO start(YoutubePlaylistImportRequestDTO request) {
        String id = UUID.randomUUID().toString();
        ImportJob job = new ImportJob(id, "RUNNING", "Importacao iniciada.", Instant.now(), null, null);
        jobs.put(id, job);

        CompletableFuture.runAsync(() -> runScript(job, request));

        return toResponse(job);
    }

    public List<YoutubePlaylistImportJobResponseDTO> list() {
        return jobs.values().stream()
                .sorted((left, right) -> right.createdAt.compareTo(left.createdAt))
                .map(this::toResponse)
                .toList();
    }

    public Optional<YoutubePlaylistImportJobResponseDTO> find(String id) {
        return Optional.ofNullable(jobs.get(id)).map(this::toResponse);
    }

    public YoutubeCookiesStatusResponseDTO cookiesStatus() {
        Path path = cookiesPath();
        if (!Files.exists(path)) {
            return new YoutubeCookiesStatusResponseDTO(false, path.toString(), null, null);
        }

        try {
            long size = Files.size(path);
            Instant updatedAt = Files.getLastModifiedTime(path).toInstant();
            return new YoutubeCookiesStatusResponseDTO(size > 0, path.toString(), size, updatedAt);
        } catch (IOException exception) {
            return new YoutubeCookiesStatusResponseDTO(false, path.toString(), null, null);
        }
    }

    public YoutubeCookiesStatusResponseDTO saveCookies(String content) {
        String normalized = normalizeCookies(content);
        validateCookies(normalized);

        Path path = cookiesPath();
        try {
            Path parent = path.getParent();
            if (parent != null) {
                Files.createDirectories(parent);
            }
            Files.writeString(
                    path,
                    normalized,
                    StandardCharsets.UTF_8,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.TRUNCATE_EXISTING,
                    StandardOpenOption.WRITE
            );
            protectCookiesFile(path);
            return cookiesStatus();
        } catch (IOException exception) {
            throw new IllegalStateException("Nao foi possivel salvar os cookies do YouTube: " + exception.getMessage(), exception);
        }
    }

    private void runScript(ImportJob job, YoutubePlaylistImportRequestDTO request) {
        List<String> command = new ArrayList<>();
        command.add("python3");
        command.add("-u");
        command.add("tools/import_youtube_playlist_to_supabase.py");
        command.add("--playlist-url");
        command.add(request.playlistUrl());
        command.add("--genre");
        command.add(request.genre());

        if (StringUtils.hasText(request.playlistTitle())) {
            command.add("--playlist-title");
            command.add(request.playlistTitle());
        }
        if (StringUtils.hasText(request.artistName())) {
            command.add("--artist-name");
            command.add(request.artistName());
        }
        if (request.limit() != null) {
            command.add("--limit");
            command.add(String.valueOf(request.limit()));
        }

        try {
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.directory(new File(System.getenv().getOrDefault("DEEFY_IMPORT_APP_DIR", ".")));
            processBuilder.environment().put("PYTHONUNBUFFERED", "1");
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    job.addOutput(line);
                }
            }

            int exitCode = process.waitFor();
            job.exitCode = exitCode;
            job.finishedAt = Instant.now();
            if (exitCode == 0) {
                job.status = "COMPLETED";
                job.message = "Playlist importada com sucesso.";
            } else {
                job.status = "FAILED";
                job.message = "O script de importacao terminou com erro.";
            }
        } catch (Exception exception) {
            job.status = "FAILED";
            job.message = "Falha ao executar importacao: " + exception.getMessage();
            job.finishedAt = Instant.now();
            job.addOutput(job.message);
        }
    }

    private YoutubePlaylistImportJobResponseDTO toResponse(ImportJob job) {
        return new YoutubePlaylistImportJobResponseDTO(
                job.id,
                job.status,
                job.message,
                job.createdAt,
                job.finishedAt,
                job.exitCode,
                job.outputSnapshot()
        );
    }

    private Path cookiesPath() {
        String configuredPath = System.getenv("YTDLP_COOKIES_FILE");
        if (StringUtils.hasText(configuredPath)) {
            return Path.of(configuredPath);
        }
        return Path.of(DEFAULT_COOKIES_PATH);
    }

    private String normalizeCookies(String content) {
        return (content == null ? "" : content)
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .trim() + "\n";
    }

    private void validateCookies(String content) {
        if (!StringUtils.hasText(content)) {
            throw new IllegalArgumentException("Cole ou envie um arquivo cookies.txt antes de salvar.");
        }

        boolean hasCookieLine = false;
        boolean hasYoutubeOrGoogleDomain = false;
        for (String line : content.split("\n")) {
            String trimmed = line.trim();
            if (trimmed.isBlank() || trimmed.startsWith("#")) {
                continue;
            }

            String[] columns = trimmed.split("\t");
            if (columns.length < 7) {
                throw new IllegalArgumentException("O arquivo precisa estar no formato Netscape cookies.txt exportado do navegador.");
            }

            hasCookieLine = true;
            String domain = columns[0].toLowerCase();
            if (domain.contains("youtube.com") || domain.contains("google.com")) {
                hasYoutubeOrGoogleDomain = true;
            }
        }

        if (!hasCookieLine || !hasYoutubeOrGoogleDomain) {
            throw new IllegalArgumentException("O arquivo nao parece conter cookies do YouTube/Google em formato Netscape.");
        }
    }

    private void protectCookiesFile(Path path) {
        try {
            Set<PosixFilePermission> permissions = PosixFilePermissions.fromString("rw-------");
            Files.setPosixFilePermissions(path, permissions);
        } catch (UnsupportedOperationException | IOException ignored) {
            // Em sistemas sem POSIX, mantemos o arquivo fora do Git e sem retornar seu conteudo pela API.
        }
    }

    private static class ImportJob {
        private final String id;
        private volatile String status;
        private volatile String message;
        private final Instant createdAt;
        private volatile Instant finishedAt;
        private volatile Integer exitCode;
        private final List<String> output = Collections.synchronizedList(new ArrayList<>());

        private ImportJob(String id, String status, String message, Instant createdAt, Instant finishedAt, Integer exitCode) {
            this.id = id;
            this.status = status;
            this.message = message;
            this.createdAt = createdAt;
            this.finishedAt = finishedAt;
            this.exitCode = exitCode;
        }

        private void addOutput(String line) {
            synchronized (output) {
                output.add(line);
                if (output.size() > OUTPUT_LIMIT) {
                    output.remove(0);
                }
            }
        }

        private List<String> outputSnapshot() {
            synchronized (output) {
                return List.copyOf(output);
            }
        }
    }
}
