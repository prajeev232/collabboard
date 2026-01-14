package com.prajeev.collabboard.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "board_memberships")
@IdClass(BoardMembershipId.class)
public class BoardMembership {
    @Getter
    @Id
    private UUID boardId;

    @Getter
    @Id
    private UUID userId;

    @Getter
    @Setter
    @Enumerated(EnumType.STRING)
    private BoardRole role;

    private OffsetDateTime createdAt;

    protected BoardMembership() {

    }

    public BoardMembership(UUID boardId, UUID userId, BoardRole role) {
        this.boardId = boardId;
        this.userId = userId;
        this.role = role;
        this.createdAt = OffsetDateTime.now();
    }
}
