package com.prajeev.collabboard.dto;

import java.util.UUID;

public record BoardResponse(UUID id, String name, String ownerName) {
}
