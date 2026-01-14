package com.prajeev.collabboard.dto;

import java.util.UUID;

public record ListResponse(UUID id, UUID boardId, String name, int position, Integer wipLimit) {
}
