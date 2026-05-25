package br.com.deefy.service.impl;

import br.com.deefy.exception.ProfilePhotoStorageException;
import br.com.deefy.model.User;
import br.com.deefy.service.ProfilePhotoStorageService;
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
public class SupabaseProfilePhotoStorageService implements ProfilePhotoStorageService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String projectUrl;
    private final String serviceRoleKey;
    private final String publicBaseUrl;
    private final String profileBucket;
    private final long maxSizeBytes;

    public SupabaseProfilePhotoStorageService(
            @Value("${supabase.project-url:}") String projectUrl,
            @Value("${supabase.service-role-key:}") String serviceRoleKey,
            @Value("${supabase.storage.public-base-url:}") String publicBaseUrl,
            @Value("${supabase.storage.profile-bucket:fotos de perfil}") String profileBucket,
            @Value("${supabase.storage.profile-max-size-bytes:5242880}") long maxSizeBytes
    ) {
        this.projectUrl = stripTrailingSlash(projectUrl);
        this.serviceRoleKey = serviceRoleKey;
        this.publicBaseUrl = stripTrailingSlash(publicBaseUrl);
        this.profileBucket = profileBucket;
        this.maxSizeBytes = maxSizeBytes;
    }

    @Override
    public String uploadProfilePhoto(User user, MultipartFile file) {
        validateConfiguration();
        validateFile(file);

        String contentType = file.getContentType().toLowerCase(Locale.ROOT);
        String objectPath = "profiles/%d/%s.%s".formatted(
                user.getId(),
                UUID.randomUUID(),
                extensionFor(contentType)
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("%s/storage/v1/object/%s/%s".formatted(
                            projectUrl,
                            encodePathSegment(profileBucket),
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
                        "Falha ao enviar foto para o Supabase Storage. Status: " + response.statusCode()
                );
            }

            return "%s/%s/%s".formatted(
                    publicBaseUrl,
                    encodePathSegment(profileBucket),
                    encodePath(objectPath)
            );
        } catch (IOException e) {
            throw new ProfilePhotoStorageException("Não foi possível ler o arquivo de foto enviado.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ProfilePhotoStorageException("Upload da foto foi interrompido.", e);
        }
    }

    private void validateConfiguration() {
        if (projectUrl.isBlank() || serviceRoleKey.isBlank() || publicBaseUrl.isBlank() || profileBucket.isBlank()) {
            throw new ProfilePhotoStorageException("Storage de foto de perfil não está configurado no ambiente.");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ProfilePhotoStorageException("Envie uma imagem para atualizar a foto de perfil.");
        }

        if (file.getSize() > maxSizeBytes) {
            throw new ProfilePhotoStorageException("A imagem deve ter no máximo 5 MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new ProfilePhotoStorageException("Formato inválido. Use JPG, PNG, WEBP ou GIF.");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "bin";
        };
    }

    private String encodePath(String path) {
        return path.replace("\\", "/")
                .replaceAll("^/+", "")
                .lines()
                .findFirst()
                .orElse("")
                .replaceAll("/+", "/")
                .transform(value -> {
                    String[] segments = value.split("/");
                    StringBuilder encoded = new StringBuilder();
                    for (int i = 0; i < segments.length; i++) {
                        if (i > 0) encoded.append("/");
                        encoded.append(encodePathSegment(segments[i]));
                    }
                    return encoded.toString();
                });
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
