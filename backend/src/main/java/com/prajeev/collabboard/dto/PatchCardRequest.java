package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.CardPriority;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record PatchCardRequest(
        String title,
        String description,
        CardPriority priority,
        Instant dueDate,
        UUID assigneeUserId,
        @NotNull Long expectedVersion
) {
}
