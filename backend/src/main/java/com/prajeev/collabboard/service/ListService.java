package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.BoardList;
import com.prajeev.collabboard.dto.ListResponse;
import com.prajeev.collabboard.exception.NotFoundException;
import com.prajeev.collabboard.realtime.*;
import com.prajeev.collabboard.repository.BoardRepository;
import com.prajeev.collabboard.repository.ListRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ListService {
    private final BoardRepository boardRepository;
    private final ListRepository listRepository;
    private final BoardEventPublisher publisher;
    private final BoardAuthService boardAuthService;
    private final BoardAuthzLookupService authzLookupService;

    public ListService(BoardRepository boardRepository, ListRepository listRepository, BoardEventPublisher publisher, BoardAuthService boardAuthService, BoardAuthzLookupService authzLookupService) {
        this.boardRepository = boardRepository;
        this.listRepository = listRepository;
        this.publisher = publisher;
        this.boardAuthService = boardAuthService;
        this.authzLookupService = authzLookupService;
    }

    @Transactional
    public ListResponse createList(UUID boardId, UUID userId, String name, Integer wipLimit) {

        if (!boardRepository.existsById(boardId)) {
            throw new NotFoundException("BOARD_NOT_FOUND", "Board with ID: " + boardId + " not found");
        }

        boardAuthService.requireWrite(boardId, userId);
        int nextPos = listRepository.maxPositionByBoardId(boardId) + 1;

        BoardList saved = listRepository.save(new BoardList(UUID.randomUUID(), boardId, name, nextPos, wipLimit));
        ListResponse res = new ListResponse(saved.getId(), saved.getBoardId(), saved.getName(), saved.getPosition(), saved.getWipLimit());

        publisher.enqueue(BoardEvent.of(boardId, BoardEventType.LIST_CREATED, new ListCreatedData(res)));

        return res;
    }

    @Transactional
    public void deleteList(UUID listId, UUID userId) {
        UUID boardId = authzLookupService.requireWriteByListId(listId, userId);
        var list = listRepository.findById(listId).orElseThrow(() -> new NotFoundException("LIST_NOT_FOUND", "List with ID: " + listId + " not found"));

        listRepository.deleteById(listId);

        publisher.enqueue(BoardEvent.of(boardId, BoardEventType.LIST_DELETED, new ListDeletedData(listId)));
    }
}
