package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.CardPriority;

import java.time.Instant;
import java.util.UUID;

public record CardResponse(
        UUID id,
        UUID listId,
        String title,
        String description,
        int position,
        long version,
        CardPriority priority,
        Instant dueDate,
        Instant updatedAt,
        UUID createdByUserId,
        UUID assigneeUserId
) {
}
