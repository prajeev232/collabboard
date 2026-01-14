package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.dto.CardResponse;
import com.prajeev.collabboard.dto.CreateCardRequest;
import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.service.CardService;
import com.prajeev.collabboard.service.ListService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/lists")
public class ListController {
    private final CardService cardService;
    private final ListService listService;

    public ListController(CardService cardService, ListService listService) {
        this.cardService = cardService;
        this.listService = listService;
    }

    @PostMapping("/{listId}/cards")
    public ResponseEntity<CardResponse> createCard(@PathVariable UUID listId,
                                                   @Valid @RequestBody CreateCardRequest request, Authentication auth) {
        UUID userId = ((AuthPrincipal) auth.getPrincipal()).userId();

        CardResponse created = cardService.createCard(listId, userId, request.title(), request.description(), request.priority(), request.dueDate(), request.assigneeUserId());
        return ResponseEntity
                .created(URI.create("/cards/" + created.id()))
                .body(created);
    }

    @DeleteMapping("/{listId}")
    public ResponseEntity<Void> deleteList(@PathVariable UUID listId, Authentication auth) {
        UUID userId = ((AuthPrincipal) auth.getPrincipal()).userId();
        listService.deleteList(listId, userId);
        return ResponseEntity.noContent().build();
    }
}
