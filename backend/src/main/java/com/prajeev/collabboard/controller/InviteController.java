package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.dto.AcceptInviteRequest;
import com.prajeev.collabboard.dto.AcceptInviteResponse;
import com.prajeev.collabboard.dto.InvitePreviewResponse;
import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.service.InviteService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/invites")
public class InviteController {
    private final InviteService inviteService;

    public InviteController(InviteService inviteService) {
        this.inviteService = inviteService;
    }

    @GetMapping("/{token}")
    public InvitePreviewResponse preview(@PathVariable String token) {
        return inviteService.preview(token);
    }

    @PostMapping("/accept")
    public AcceptInviteResponse accept(@Valid @RequestBody AcceptInviteRequest request, Authentication auth) {
        AuthPrincipal p = (AuthPrincipal) auth.getPrincipal();
        return inviteService.acceptInvite(request.token(), p.userId(), p.email());
    }
}
