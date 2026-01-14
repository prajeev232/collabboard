package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.BoardMembership;
import com.prajeev.collabboard.domain.BoardRole;
import com.prajeev.collabboard.exception.ForbiddenException;
import com.prajeev.collabboard.repository.BoardMembershipRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BoardAuthService {
    private final BoardMembershipRepository repo;

    public BoardAuthService(BoardMembershipRepository repo) {
        this.repo = repo;
    }

    public BoardRole getUserRole(UUID boardId, UUID userId) {
        return repo.findRole(boardId, userId)
                .orElseThrow(() -> new ForbiddenException("NOT_A_MEMBER", "You're not a member of this board"));
    }

    public BoardRole requireMember(UUID boardId, UUID userId) {
        return getUserRole(boardId, userId);
    }

    public void requireWrite(UUID boardId, UUID userId) {
        BoardRole role = requireMember(boardId, userId);
        if (role == BoardRole.VIEWER) {
            throw new ForbiddenException("INSUFFICIENT_ROLE", "You do not have permission to modify this board");
        }
    }

    public void requireOwner(UUID boardId, UUID userId) {
        BoardRole role = requireMember(boardId, userId);
        if (role != BoardRole.OWNER) {
            throw new ForbiddenException("OWNER_REQUIRED", "Only board owners can perform this action");
        }
    }
}
