package com.prajeev.collabboard.dto;

import com.prajeev.collabboard.domain.BoardRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record CreateInviteRequest(
        @Email String email,
        @NotNull BoardRole role
        ) {
}
