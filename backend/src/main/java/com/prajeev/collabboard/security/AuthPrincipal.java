package com.prajeev.collabboard.security;

import java.util.UUID;

public record AuthPrincipal(
        UUID userId,
        String email
) {

}
