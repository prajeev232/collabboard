package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.*;
import com.prajeev.collabboard.dto.*;
import com.prajeev.collabboard.repository.BoardMembershipRepository;
import com.prajeev.collabboard.repository.BoardRepository;
import com.prajeev.collabboard.repository.CardRepository;
import com.prajeev.collabboard.repository.ListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import com.prajeev.collabboard.exception.NotFoundException;

@Service
public class BoardService {
    private final BoardRepository boardRepository;
    private final ListRepository listRepository;
    private final CardRepository cardRepository;
    private final BoardMembershipRepository boardMembershipRepository;
    private final BoardAuthService boardAuthService;

    public BoardService(BoardRepository boardRepository, ListRepository listRepository, CardRepository cardRepository, BoardMembershipRepository boardMembershipRepository, BoardAuthService boardAuthService) {
        this.boardRepository = boardRepository;
        this.listRepository = listRepository;
        this.cardRepository = cardRepository;
        this.boardMembershipRepository = boardMembershipRepository;
        this.boardAuthService = boardAuthService;
    }

    @Transactional
    public Board createBoard(String name, UUID userId) {
        Board board = new Board(UUID.randomUUID(), name.trim());
        Board saved = boardRepository.save(board);

        boardMembershipRepository.save(new BoardMembership(saved.getId(), userId, BoardRole.OWNER));

        return saved;
    }

    @Transactional(readOnly = true)
    public List<BoardResponse> listBoards(UUID userId) {
        List<UUID> boardIds = boardMembershipRepository.findByUserId(userId).stream()
                .map(BoardMembership::getBoardId)
                .toList();

        if (boardIds.isEmpty()) return List.of();

        var owners = boardMembershipRepository.findOwnersByBoardIds(boardIds).stream()
                .collect(Collectors.toMap(
                        BoardMembershipRepository.BoardOwnerRow::getBoardId,
                        BoardMembershipRepository.BoardOwnerRow::getOwnerName
                ));

        return boardRepository.findAllById(boardIds).stream()
                .map(b -> new BoardResponse(
                        b.getId(),
                        b.getName(),
                        owners.getOrDefault(b.getId(), "Unknown")
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Board getBoardOrThrow(UUID id) {
        return boardRepository.findById(id).orElseThrow(
                () -> new NotFoundException("BOARD_NOT_FOUND", "Board with ID: " + id + " not found.")
        );
    }

    @Transactional
    public void updateMemberRole(UUID boardId, UUID requesterId, UUID memberId, BoardRole newRole) {
        if (memberId.equals(requesterId)) {
            throw new IllegalArgumentException("Owner cannot change/remove themselves.");
        }

        boardAuthService.requireOwner(boardId, requesterId);

        if (newRole == BoardRole.OWNER) {
            throw new IllegalArgumentException("Cannot assign OWNER role via this endpoint.");
        }

        BoardMembership m = boardMembershipRepository.findByBoardIdAndUserId(boardId, memberId)
                .orElseThrow(() -> new NotFoundException("MEMBERSHIP_NOT_FOUND", "User is not a member of this board."));

        if (m.getRole() == BoardRole.OWNER) {
            throw new IllegalArgumentException("Cannot change role of board OWNER.");
        }

        m.setRole(newRole);
        boardMembershipRepository.save(m);
    }

    @Transactional
    public void removeMember(UUID boardId, UUID requesterId, UUID memberId) {
        if (memberId.equals(requesterId)) {
            throw new IllegalArgumentException("Owner cannot change/remove themselves.");
        }

        boardAuthService.requireOwner(boardId, requesterId);

        BoardMembership m = boardMembershipRepository.findByBoardIdAndUserId(boardId, memberId)
                .orElseThrow(() -> new NotFoundException("MEMBERSHIP_NOT_FOUND", "User is not a member of this board."));

        if (m.getRole() == BoardRole.OWNER) {
            throw new IllegalArgumentException("Cannot remove the board OWNER.");
        }

        boardMembershipRepository.delete(m);
    }

    @Transactional(readOnly = true)
    public BoardSnapshotResponse getSnapshot(UUID id, UUID userId) {
        boardAuthService.requireMember(id, userId);
        Board board = getBoardOrThrow(id);

        List<BoardList> listEntities = listRepository.findByBoardIdOrderByPositionAsc(id);

        List<ListResponse> lists = listEntities.stream()
                .map(l -> new ListResponse(l.getId(), l.getBoardId(), l.getName(), l.getPosition(), l.getWipLimit()))
                .toList();

        List<UUID> listIds = listEntities.stream()
                .map(BoardList::getId)
                .toList();

        var cardsByListId = listIds.isEmpty()
                ? Map.<UUID, List<CardResponse>>of()
                : cardRepository.findByListIdInOrderByListIdAscPositionAsc(listIds)
                .stream()
                .collect(Collectors.groupingBy(
                        Card::getListId,
                        Collectors.mapping(
                                c -> new CardResponse(
                                        c.getId(),
                                        c.getListId(),
                                        c.getTitle(),
                                        c.getDescription(),
                                        c.getPosition(),
                                        c.getVersion(),
                                        c.getPriority(),
                                        c.getDueDate(),
                                        c.getUpdatedAt(),
                                        c.getCreatedByUserId(),
                                        c.getAssigneeUserId()
                                ),
                                Collectors.toList()
                        )
                ));

        var normalized = new HashMap<UUID, List<CardResponse>>();

        for (UUID listId : listIds) {
            normalized.put(listId, cardsByListId.getOrDefault(listId, List.of()));
        }

        String ownerName = boardMembershipRepository.listMembers(id).stream()
                .filter(m -> m.role() == BoardRole.OWNER)
                .findFirst()
                .map(m -> (m.displayName() != null && !m.displayName().isBlank()) ? m.displayName() : m.email())
                .orElse("Unknown");

        return new BoardSnapshotResponse(
                new BoardResponse(board.getId(), board.getName(), ownerName),
                lists,
                normalized
        );
    }

    @Transactional(readOnly = true)
    public List<BoardMemberResponse> listMembers(UUID boardId, UUID userId) {
        boardAuthService.requireMember(boardId, userId);
        return boardMembershipRepository.listMembers(boardId);
    }

    @Transactional
    public void deleteBoard(UUID boardId, UUID userId) {
        boardAuthService.requireOwner(boardId, userId);
        boardRepository.deleteById(boardId);
    }
}
