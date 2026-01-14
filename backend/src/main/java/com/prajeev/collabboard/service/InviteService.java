package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.BoardInvite;
import com.prajeev.collabboard.domain.BoardMembership;
import com.prajeev.collabboard.domain.BoardRole;
import com.prajeev.collabboard.domain.InviteStatus;
import com.prajeev.collabboard.dto.*;
import com.prajeev.collabboard.exception.ConflictException;
import com.prajeev.collabboard.exception.ForbiddenException;
import com.prajeev.collabboard.exception.NotFoundException;
import com.prajeev.collabboard.repository.BoardInviteRepository;
import com.prajeev.collabboard.repository.BoardMembershipRepository;
import com.prajeev.collabboard.repository.BoardRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class InviteService {
    private static final Logger log = LoggerFactory.getLogger(InviteService.class);

    private final BoardAuthService boardAuthService;
    private final BoardInviteRepository inviteRepository;
    private final InviteTokenService tokenService;
    private final BoardMembershipRepository boardMembershipRepository;
    private final BoardRepository boardRepository;
    private final InviteEmailService inviteEmailService;

    public InviteService(BoardAuthService boardAuthService, BoardInviteRepository inviteRepository, InviteTokenService tokenService, BoardMembershipRepository boardMembershipRepository, BoardRepository boardRepository, InviteEmailService inviteEmailService) {
        this.boardAuthService = boardAuthService;
        this.inviteRepository = inviteRepository;
        this.tokenService = tokenService;
        this.boardMembershipRepository = boardMembershipRepository;
        this.boardRepository = boardRepository;
        this.inviteEmailService = inviteEmailService;
    }

    @Transactional
    public InviteResponse createInvite(UUID boardId, UUID creatorUserId, CreateInviteRequest request) {
        boardAuthService.requireOwner(boardId, creatorUserId);
        String email = request.email().trim().toLowerCase();

        if(request.role() == BoardRole.OWNER) {
            throw new IllegalArgumentException("Can't invite as owner!");
        }

        var existing = inviteRepository.findByBoardIdAndEmailAndStatus(boardId, email, InviteStatus.PENDING);
        if (existing.isPresent()) {
            BoardInvite invite = existing.get();
            return new InviteResponse(
                    invite.getId(),
                    invite.getBoardId(),
                    invite.getEmail(),
                    invite.getRole(),
                    invite.getStatus(),
                    invite.getExpiresAt(),
                    invite.getCreatedAt()
            );
        }

        String rawToken = tokenService.generateRawToken();
        String tokenHash = tokenService.hash(rawToken);

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime expiresAt = now.plusDays(7);

        BoardInvite invite = new BoardInvite(
                UUID.randomUUID(),
                boardId,
                email,
                request.role(),
                tokenHash,
                InviteStatus.PENDING,
                expiresAt,
                now,
                creatorUserId
        );

        inviteRepository.save(invite);

        String boardName = boardRepository.findById(boardId).map(b -> b.getName()).orElse("Your board");

        try {
            inviteEmailService.sendBoardInvite(email, boardName, rawToken);
        } catch (Exception e) {
            // Don't fail invite creation if email fails; surface in logs for debugging.
            log.warn("Failed to send invite email to {} for boardId {}: {}", email, boardId, e.toString());
        }

        return new InviteResponse(
                invite.getId(),
                invite.getBoardId(),
                invite.getEmail(),
                invite.getRole(),
                invite.getStatus(),
                invite.getExpiresAt(),
                invite.getCreatedAt()
        );
    }

    @Transactional
    public AcceptInviteResponse acceptInvite(String rawToken, UUID userId, String userEmail) {
        String tokenHash = tokenService.hash(rawToken);
        BoardInvite invite = inviteRepository.findByTokenHashAndStatus(tokenHash, InviteStatus.PENDING)
                .orElseThrow(() -> new NotFoundException("INVITE_NOT_FOUND", "Invite is invalid or already used"));

        if (invite.getExpiresAt().isBefore(OffsetDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
            throw new ConflictException("INVITE_EXPIRED", "Invite has expired", null);
        }

        String normalized = userEmail.trim().toLowerCase();
        if (!invite.getEmail().equalsIgnoreCase(normalized)) {
            throw new ForbiddenException("INVITE_EMAIL_MISMATCH", "This invite wasn't sent to your account");
        }

        boolean alreadyMember = boardMembershipRepository.existsByBoardIdAndUserId(invite.getBoardId(), userId);

        if (!alreadyMember) {
            boardMembershipRepository.save(new BoardMembership(invite.getBoardId(), userId, invite.getRole()));
        }

        invite.setStatus(InviteStatus.ACCEPTED);
        invite.setAcceptedAt(OffsetDateTime.now());
        invite.setAcceptedBy(userId);
        inviteRepository.save(invite);

        return new AcceptInviteResponse(invite.getBoardId(), invite.getRole());
    }

    @Transactional(readOnly = true)
    public List<InviteListResponse> listInvites(UUID boardId, UUID userId, InviteStatus status) {
        boardAuthService.requireOwner(boardId, userId);

        InviteStatus st = (status == null) ? InviteStatus.PENDING : status;

        return inviteRepository.findByBoardIdAndStatusOrderByCreatedAtDesc(boardId, st).stream()
                .map(inv -> new InviteListResponse(
                        inv.getId(),
                        inv.getBoardId(),
                        inv.getEmail(),
                        inv.getRole(),
                        inv.getStatus(),
                        inv.getExpiresAt(),
                        inv.getCreatedAt(),
                        inv.getCreatedBy()
                )).toList();
    }

    @Transactional
    public InvitePreviewResponse preview(String rawToken) {
        String tokenHash = tokenService.hash(rawToken);

        BoardInvite invite = inviteRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new NotFoundException("INVITE_NOT_FOUND", "Invite is invalid"));

        if (invite.getStatus() == InviteStatus.PENDING &&
        invite.getExpiresAt() != null &&
        invite.getExpiresAt().isBefore(OffsetDateTime.now())) {
            invite.setStatus(InviteStatus.EXPIRED);
            inviteRepository.save(invite);
        }

        String boardName = boardRepository.findById(invite.getBoardId())
                .map(b -> b.getName())
                .orElse("Unknown board");

        return new InvitePreviewResponse(
                invite.getBoardId(),
                boardName,
                invite.getEmail(),
                invite.getRole(),
                invite.getStatus(),
                invite.getExpiresAt()
        );
    }
}
