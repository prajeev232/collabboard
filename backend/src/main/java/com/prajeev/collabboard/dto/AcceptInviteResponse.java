package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;

import java.util.UUID;

public record AcceptInviteResponse(UUID boardId, BoardRole role) {
}
