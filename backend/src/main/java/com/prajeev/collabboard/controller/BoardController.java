package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.domain.Board;
import com.prajeev.collabboard.dto.*;
import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.service.BoardAuthService;
import com.prajeev.collabboard.service.BoardService;
import com.prajeev.collabboard.service.ListService;
import jakarta.validation.Valid;
import org.apache.coyote.Response;
import org.hibernate.sql.Update;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/boards")
public class BoardController {
    private final BoardService boardService;
    private final ListService listService;
    private final BoardAuthService boardAuthService;

    public BoardController(BoardService boardService, ListService listService, BoardAuthService boardAuthService) {
        this.boardService = boardService;
        this.listService = listService;
        this.boardAuthService = boardAuthService;
    }

    @PostMapping
    public ResponseEntity<BoardResponse> create(@Valid @RequestBody CreateBoardRequest request, Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        UUID userId = principal.userId();

        Board saved = boardService.createBoard(request.name(), userId);

        return ResponseEntity
                .created(URI.create("/boards/" + saved.getId()))
                .body(new BoardResponse(saved.getId(), saved.getName(), principal.email()));
    }

    @GetMapping("/{boardId}")
    public BoardSnapshotResponse getSnapshot(@PathVariable("boardId") UUID boardId, Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        UUID userId = principal.userId();

        return boardService.getSnapshot(boardId, userId);
    }

    @GetMapping
    public List<BoardResponse> getBoards(Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        UUID userId = principal.userId();

        return boardService.listBoards(userId);
    }

    @PostMapping("/{boardId}/lists")
    public ResponseEntity<ListResponse> createList(@PathVariable UUID boardId,
                                                   @Valid @RequestBody CreateListRequest request,
                                                   Authentication auth) {

        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        ListResponse created = listService.createList(boardId, principal.userId(), request.name(), request.wipLimit());

        return ResponseEntity
                .created(URI.create("/lists/" + created.id()))
                .body(created);
    }

    @GetMapping("/{boardId}/members")
    public List<BoardMemberResponse> listMembers(@PathVariable UUID boardId, Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        return boardService.listMembers(boardId, principal.userId());
    }

    @GetMapping("/{boardId}/me/role")
    public BoardRoleResponse getRole(@PathVariable UUID boardId, Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        UUID userId = principal.userId();
        return new BoardRoleResponse(boardAuthService.getUserRole(boardId, userId));
    }

    @PatchMapping("/{boardId}/members/{memberId}")
    public ResponseEntity<Void> updateMemberRole(@PathVariable UUID boardId,
                                                 @PathVariable UUID memberId,
                                                 @Valid @RequestBody UpdateBoardMemberRoleRequest request,
                                                 Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        boardService.updateMemberRole(boardId, principal.userId(), memberId, request.role());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{boardId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID boardId,
            @PathVariable UUID memberId,
            Authentication auth
    ) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        boardService.removeMember(boardId, principal.userId(), memberId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<Void> removeBoard(@PathVariable UUID boardId, Authentication auth) {
        AuthPrincipal principal = (AuthPrincipal) auth.getPrincipal();
        boardService.deleteBoard(boardId, principal.userId());
        return ResponseEntity.noContent().build();
    }
}
