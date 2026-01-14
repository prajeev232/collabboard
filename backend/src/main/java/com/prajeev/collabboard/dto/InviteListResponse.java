package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;
import com.prajeev.collabboard.domain.InviteStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InviteListResponse(
        UUID id,
        UUID boardId,
        String email,
        BoardRole role,
        InviteStatus status,
        OffsetDateTime expiresAt,
        OffsetDateTime createdAt,
        UUID createdBy
) {
}
