package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.CardPriority;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;
import java.util.UUID;

public record CreateCardRequest(
        @NotBlank String title,
        String description,
        CardPriority priority,
        Instant dueDate,
        UUID assigneeUserId
) {
}
