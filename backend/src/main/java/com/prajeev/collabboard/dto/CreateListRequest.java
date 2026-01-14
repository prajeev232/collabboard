package com.prajeev.collabboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CreateListRequest(@NotBlank String name, @Positive Integer wipLimit) {

}
