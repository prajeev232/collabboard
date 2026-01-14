package com.prajeev.collabboard.dto;

public record ConflictResponse<T>(
        String code,
        String message,
        T latest
) {
}
