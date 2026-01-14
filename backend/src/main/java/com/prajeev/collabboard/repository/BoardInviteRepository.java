package com.prajeev.collabboard.repository;

import com.prajeev.collabboard.domain.BoardInvite;
import com.prajeev.collabboard.domain.InviteStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardInviteRepository extends JpaRepository<BoardInvite, UUID> {
    Optional<BoardInvite> findByBoardIdAndEmailAndStatus(UUID boardId, String email, InviteStatus status);
    boolean existsByBoardIdAndEmailAndStatus(UUID boardId, String email, InviteStatus status);
    Optional<BoardInvite> findByTokenHash(String tokenHash);
    Optional<BoardInvite> findByTokenHashAndStatus(String tokenHash, InviteStatus status);
    List<BoardInvite> findByBoardIdAndStatusOrderByCreatedAtDesc(UUID boardId, InviteStatus status);
}