package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.domain.InviteStatus;
import com.prajeev.collabboard.dto.CreateInviteRequest;
import com.prajeev.collabboard.dto.InviteListResponse;
import com.prajeev.collabboard.dto.InviteResponse;
import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.service.InviteService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/boards/{boardId}/invites")
public class BoardInviteController {
    private final InviteService inviteService;

    public BoardInviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @PostMapping
    public InviteResponse create(@PathVariable UUID boardId,
                                 @Valid @RequestBody CreateInviteRequest request,
                                 Authentication authentication) {
        UUID userId = ((AuthPrincipal) authentication.getPrincipal()).userId();
        return inviteService.createInvite(boardId, userId, request);
    }

    @GetMapping
    public List<InviteListResponse> list(@PathVariable UUID boardId,
                                         @RequestParam(required = false)InviteStatus status,
                                         Authentication authentication) {
        UUID userId = ((AuthPrincipal) authentication.getPrincipal()).userId();
        return inviteService.listInvites(boardId, userId, status);
    }
}
