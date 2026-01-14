package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;

import java.time.OffsetDateTime;
import java.util.UUID;

public record BoardMemberResponse(
        UUID userId,
        String email,
        String displayName,
        BoardRole role,
        OffsetDateTime joinedAt
) {
}
