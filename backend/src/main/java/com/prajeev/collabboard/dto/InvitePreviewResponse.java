package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;
import com.prajeev.collabboard.domain.InviteStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

public record InvitePreviewResponse(
        UUID boardId,
        String boardName,
        String email,
        BoardRole role,
        InviteStatus status,
        OffsetDateTime expiresAt
) {
}
