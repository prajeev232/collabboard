package com.prajeev.collabboard.dto;

public record LoginResponse(
        boolean ok,
        AuthUserResponse user,
        String accessToken
) {
}
