package br.com.deefy.dto.response;

public record AdminUserStatsResponseDTO(
        long total,
        long active,
        long banned,
        long newThisMonth,
        long admins,
        long deleted,
        long offline,
        long online
) {
}
