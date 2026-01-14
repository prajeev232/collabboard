package com.prajeev.collabboard.exception;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        String error,
        String message,
        String path,
        Instant ts,
        Map<String, String> fieldErrors,
        Map<String, Object> details
) {
    public static ApiError of(String error, String message, String path) {
        return new ApiError(error, message, path, Instant.now(), null, null);
    }

    public static ApiError of(String error, String message, String path, Map<String, String> fieldErrors) {
        return new ApiError(error, message, path, Instant.now(), fieldErrors, null);
    }

    public static ApiError ofDetails(String error, String message, String path, Map<String, Object> details) {
        return new ApiError(error, message, path, Instant.now(), null, details);
    }
}
