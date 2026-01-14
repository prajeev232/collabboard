package com.prajeev.collabboard.dto;

import java.util.UUID;

public record AuthUserResponse(
        UUID id,
        String email,
        String displayName
) {
}
