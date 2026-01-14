package com.prajeev.collabboard.dto;

import jakarta.validation.constraints.NotNull;

public record DeleteCardRequest(@NotNull Long expectedVersion) {
}
