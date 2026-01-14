package com.prajeev.collabboard.domain;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class BoardMembershipId implements Serializable {
    private UUID boardId;
    private UUID userId;

    public BoardMembershipId() {}

    public BoardMembershipId(UUID boardId, UUID userId) {
        this.boardId = boardId;
        this.userId = userId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BoardMembershipId)) return false;
        return Objects.equals(boardId, ((BoardMembershipId) o).boardId) && Objects.equals(userId, ((BoardMembershipId) o).userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(boardId, userId);
    }
}
