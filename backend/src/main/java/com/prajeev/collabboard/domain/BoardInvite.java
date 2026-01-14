package com.prajeev.collabboard.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_invites")
@Getter
public class BoardInvite {
    @Id
    private UUID id;

    private UUID boardId;

    private String email;

    @Enumerated(EnumType.STRING)
    private BoardRole role;

    private String tokenHash;

    @Enumerated(EnumType.STRING)
    @Setter
    private InviteStatus status;

    private OffsetDateTime expiresAt;

    private OffsetDateTime createdAt;

    @Setter
    private OffsetDateTime acceptedAt;

    private UUID createdBy;

    @Setter
    private UUID acceptedBy;

    protected BoardInvite() {}

    public BoardInvite(UUID id, UUID boardId, String email, BoardRole role, String tokenHash,
                       InviteStatus status, OffsetDateTime expiresAt, OffsetDateTime createdAt, UUID createdBy) {
        this.id = id;
        this.boardId = boardId;
        this.email = email;
        this.role = role;
        this.tokenHash = tokenHash;
        this.status = status;
        this.expiresAt = expiresAt;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
}
