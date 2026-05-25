package br.com.deefy.service.impl;

import br.com.deefy.exception.ProfilePhotoStorageException;
import br.com.deefy.service.CatalogStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class SupabaseCatalogStorageService implements CatalogStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/x-wav",
            "audio/ogg",
            "audio/webm",
            "audio/flac",
            "audio/x-flac"
    );

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String projectUrl;
    private final String serviceRoleKey;
    private final String publicBaseUrl;
    private final String imageBucket;
    private final String musicBucket;
    private final long imageMaxSizeBytes;
    private final long audioMaxSizeBytes;

    public SupabaseCatalogStorageService(
            @Value("${supabase.project-url:}") String projectUrl,
            @Value("${supabase.service-role-key:}") String serviceRoleKey,
            @Value("${supabase.storage.public-base-url:}") String publicBaseUrl,
            @Value("${supabase.storage.image-bucket:imagens}") String imageBucket,
            @Value("${supabase.storage.music-bucket:musicas}") String musicBucket,
            @Value("${supabase.storage.image-max-size-bytes:10485760}") long imageMaxSizeBytes,
            @Value("${supabase.storage.audio-max-size-bytes:52428800}") long audioMaxSizeBytes
    ) {
        this.projectUrl = stripTrailingSlash(projectUrl);
        this.serviceRoleKey = serviceRoleKey;
        this.publicBaseUrl = stripTrailingSlash(publicBaseUrl);
        this.imageBucket = imageBucket;
        this.musicBucket = musicBucket;
        this.imageMaxSizeBytes = imageMaxSizeBytes;
        this.audioMaxSizeBytes = audioMaxSizeBytes;
    }

    @Override
    public String uploadImage(MultipartFile file) {
        validateFile(file, ALLOWED_IMAGE_TYPES, imageMaxSizeBytes, "imagem", "JPG, PNG, WEBP ou GIF");
        String contentType = normalizedContentType(file);
        String objectPath = "catalog/images/%s.%s".formatted(UUID.randomUUID(), extensionFor(file, contentType));
        return upload(file, imageBucket, objectPath, contentType);
    }

    @Override
    public String uploadAudio(MultipartFile file) {
        validateFile(file, ALLOWED_AUDIO_TYPES, audioMaxSizeBytes, "áudio", "MP3, WAV, OGG, WEBM ou FLAC");
        String contentType = normalizedContentType(file);
        String objectPath = "catalog/audio/%s.%s".formatted(UUID.randomUUID(), extensionFor(file, contentType));
        return upload(file, musicBucket, objectPath, contentType);
    }

    private String upload(MultipartFile file, String bucket, String objectPath, String contentType) {
        validateConfiguration(bucket);

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("%s/storage/v1/object/%s/%s".formatted(
                            projectUrl,
                            encodePathSegment(bucket),
                            encodePath(objectPath)
                    )))
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .header("apikey", serviceRoleKey)
                    .header("Content-Type", contentType)
                    .header("x-upsert", "true")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(file.getBytes()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ProfilePhotoStorageException(
                        "Falha ao enviar arquivo para o Supabase Storage. Status: " + response.statusCode()
                );
            }

            return "%s/%s/%s".formatted(
                    publicBaseUrl,
                    encodePathSegment(bucket),
                    encodePath(objectPath)
            );
        } catch (IOException e) {
            throw new ProfilePhotoStorageException("Não foi possível ler o arquivo enviado.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ProfilePhotoStorageException("Upload do arquivo foi interrompido.", e);
        }
    }

    private void validateConfiguration(String bucket) {
        if (projectUrl.isBlank() || serviceRoleKey.isBlank() || publicBaseUrl.isBlank() || bucket.isBlank()) {
            throw new ProfilePhotoStorageException("Storage do catálogo não está configurado no ambiente.");
        }
    }

    private void validateFile(MultipartFile file, Set<String> allowedTypes, long maxSizeBytes, String label, String allowedText) {
        if (file == null || file.isEmpty()) {
            throw new ProfilePhotoStorageException("Envie um arquivo de " + label + ".");
        }

        if (file.getSize() > maxSizeBytes) {
            long maxMb = Math.max(1, maxSizeBytes / 1024 / 1024);
            throw new ProfilePhotoStorageException("O arquivo de " + label + " deve ter no máximo " + maxMb + " MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ProfilePhotoStorageException("Formato inválido. Use " + allowedText + ".");
        }
    }

    private String normalizedContentType(MultipartFile file) {
        return file.getContentType().toLowerCase(Locale.ROOT);
    }

    private String extensionFor(MultipartFile file, String contentType) {
        String originalName = file.getOriginalFilename();
        if (originalName != null && originalName.contains(".")) {
            String extension = originalName.substring(originalName.lastIndexOf('.') + 1)
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[^a-z0-9]", "");
            if (!extension.isBlank()) {
                return extension;
            }
        }

        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "audio/mpeg", "audio/mp3" -> "mp3";
            case "audio/wav", "audio/x-wav" -> "wav";
            case "audio/ogg" -> "ogg";
            case "audio/webm" -> "webm";
            case "audio/flac", "audio/x-flac" -> "flac";
            default -> "bin";
        };
    }

    private String encodePath(String path) {
        String normalized = path.replace("\\", "/").replaceAll("^/+", "").replaceAll("/+", "/");
        String[] segments = normalized.split("/");
        StringBuilder encoded = new StringBuilder();
        for (int i = 0; i < segments.length; i++) {
            if (i > 0) encoded.append("/");
            encoded.append(encodePathSegment(segments[i]));
        }
        return encoded.toString();
    }

    private String encodePathSegment(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }

    private String stripTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("/+$", "");
    }
}
