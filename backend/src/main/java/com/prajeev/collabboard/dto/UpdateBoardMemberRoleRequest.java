package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;
import jakarta.validation.constraints.NotNull;

public record UpdateBoardMemberRoleRequest(@NotNull BoardRole role) {
}
