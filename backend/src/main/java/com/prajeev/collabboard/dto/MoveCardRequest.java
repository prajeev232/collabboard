package com.prajeev.collabboard.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;

import java.util.UUID;

public record MoveCardRequest(@NotNull UUID toListId, @Min(0) int toPosition, @NotNull Long expectedVersion) {

}
