package com.prajeev.collabboard.service;

import com.prajeev.collabboard.exception.NotFoundException;
import com.prajeev.collabboard.repository.CardRepository;
import com.prajeev.collabboard.repository.ListRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class BoardAuthzLookupService {
    private final ListRepository listRepository;
    private final BoardAuthService boardAuthService;
    private final CardRepository cardRepository;

    public BoardAuthzLookupService(ListRepository listRepository, BoardAuthService boardAuthService, CardRepository cardRepository) {
        this.listRepository = listRepository;
        this.boardAuthService = boardAuthService;
        this.cardRepository = cardRepository;
    }

    public UUID requireReadByListId(UUID listId, UUID userId) {
        UUID boardId = listRepository.findBoardIdByListId(listId)
                .orElseThrow(() -> new NotFoundException("LIST_NOT_FOUND", "List with id: " + listId + " not found"));
        boardAuthService.requireMember(boardId, userId);
        return boardId;
    }

    public UUID requireReadByCardId(UUID cardId, UUID userId) {
        UUID boardId = cardRepository.findBoardIdByCardId(cardId)
                .orElseThrow(() -> new NotFoundException("CARD_NOT_FOUND", "Card with id: " + cardId + " not found"));
        boardAuthService.requireMember(boardId, userId);
        return boardId;
    }

    public UUID requireWriteByListId(UUID listId, UUID userId) {
        UUID boardId = listRepository.findBoardIdByListId(listId)
                .orElseThrow(() -> new NotFoundException("LIST_NOT_FOUND", "List with id: " + listId + " not found"));
        boardAuthService.requireWrite(boardId, userId);
        return boardId;
    }

    public UUID requireWriteByCardId(UUID cardId, UUID userId) {
        UUID boardId = cardRepository.findBoardIdByCardId(cardId)
                .orElseThrow(() -> new NotFoundException("CARD_NOT_FOUND", "Card with id: " + cardId + " not found"));
        boardAuthService.requireWrite(boardId, userId);
        return boardId;
    }
}
