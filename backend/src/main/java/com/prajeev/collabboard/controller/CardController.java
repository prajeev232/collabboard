package com.prajeev.collabboard.controller;

import com.prajeev.collabboard.domain.Card;
import com.prajeev.collabboard.dto.CardResponse;
import com.prajeev.collabboard.dto.DeleteCardRequest;
import com.prajeev.collabboard.dto.MoveCardRequest;
import com.prajeev.collabboard.dto.PatchCardRequest;
import com.prajeev.collabboard.security.AuthPrincipal;
import com.prajeev.collabboard.service.CardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cards")
public class CardController {
    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    @PatchMapping("/{cardId}")
    public CardResponse updateCard(@PathVariable("cardId") UUID cardId, @RequestBody @Valid PatchCardRequest request, Authentication auth) {
        UUID userId = ((AuthPrincipal) auth.getPrincipal()).userId();

        return cardService.patchCard(cardId, userId, request.title(), request.description(), request.priority(), request.dueDate(), request.assigneeUserId(), request.expectedVersion());
    }

    @PostMapping("/{cardId}/move")
    public ResponseEntity<CardResponse> move(
            @PathVariable UUID cardId,
            @Valid @RequestBody MoveCardRequest request,
            Authentication auth
            ) {
        UUID userId = ((AuthPrincipal) auth.getPrincipal()).userId();
        CardResponse moved = cardService.moveCard(cardId, userId, request.toListId(), request.toPosition(), request.expectedVersion());
        return ResponseEntity.ok(moved);
    }

    @DeleteMapping("/{cardId}")
    public ResponseEntity<Void> deleteCard(
            @PathVariable UUID cardId,
            @Valid @RequestBody DeleteCardRequest request,
            Authentication auth
    ) {
        UUID userId = ((AuthPrincipal) auth.getPrincipal()).userId();
        cardService.deleteCard(cardId, userId, request.expectedVersion());
        return ResponseEntity.noContent().build();
    }
}
