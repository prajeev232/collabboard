package com.prajeev.collabboard.service;

import com.prajeev.collabboard.domain.Card;
import com.prajeev.collabboard.domain.CardPriority;
import com.prajeev.collabboard.dto.CardResponse;
import com.prajeev.collabboard.exception.ConflictException;
import com.prajeev.collabboard.exception.NotFoundException;
import com.prajeev.collabboard.exception.WipLimitExceededException;
import com.prajeev.collabboard.realtime.*;
import com.prajeev.collabboard.repository.CardRepository;
import com.prajeev.collabboard.repository.ListRepository;
import com.prajeev.collabboard.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class CardService {
    private final ListRepository listRepository;
    private final CardRepository cardRepository;
    private final BoardEventPublisher publisher;
    private final BoardAuthzLookupService authzLookup;
    private final UserRepository userRepository;

    private static final int TEMP_POS = 1_000_000_000;          // use 1_000_000_000 if you have CHECK(position >= 0)
    private static final int SHIFT_OFFSET = 1_000_000; // must be > max cards per list (practically true)

    public CardService(ListRepository listRepository, CardRepository cardRepository, BoardEventPublisher publisher, BoardAuthzLookupService authzLookup, UserRepository userRepository) {
        this.listRepository = listRepository;
        this.cardRepository = cardRepository;
        this.userRepository = userRepository;
        this.publisher = publisher;
        this.authzLookup = authzLookup;
    }

    @Transactional
    public CardResponse createCard(UUID listId, UUID userId, String title, String description, CardPriority priority, Instant dueDate, UUID assigneeUserId) {
        authzLookup.requireWriteByListId(listId, userId);

        // ✅ lock destination list row
        var list = listRepository.findByIdForUpdate(listId).orElseThrow(
                () -> new NotFoundException("LIST_NOT_FOUND", "List with ID: " + listId + " not found.")
        );

        // ✅ enforce WIP
        Integer wip = list.getWipLimit(); // wipLimit should be Integer (nullable)
        if (wip != null) {
            long current = cardRepository.countByListId(listId);
            if (current >= wip) throw new WipLimitExceededException(wip);
        }

        UUID assignee = null;
        if (assigneeUserId != null) {
            if (!userRepository.existsById(assigneeUserId)) {
                throw new NotFoundException("USER_NOT_FOUND", "Assignee with ID: " + assigneeUserId + " not found.");
            }

            assignee = assigneeUserId;
        }

        int nextPos = cardRepository.maxPositionBylistId(listId) + 1;
        String desc = (description == null) ? "" : description.trim();

        Card saved = cardRepository.save(new Card(
                UUID.randomUUID(),
                listId,
                title.trim(),
                desc,
                nextPos,
                1L,
                Instant.now(),
                priority,
                dueDate,
                userId,
                assignee
        ));

        CardResponse res = toResponse(saved);

        publisher.enqueue(BoardEvent.of(list.getBoardId(), BoardEventType.CARD_CREATED, new CardCreatedData(res)));

        return res;
    }


    @Transactional
    public CardResponse patchCard(UUID cardId, UUID userId, String title, String description, CardPriority priority, Instant dueDate, UUID assigneeUserId, long expectedVersion) {
        authzLookup.requireWriteByCardId(cardId, userId);
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("CARD_NOT_FOUND", "Card with ID: " + cardId + " not found."));

        if (card.getVersion() != expectedVersion) {
            throw new ConflictException(
                    "CARD_VERSION_CONFLICT",
                    "Card was updated elsewhere!",
                    toResponse(card)
            );
        }

        if (title != null) {
            String t = title.trim();
            if (t.isBlank()) throw new IllegalArgumentException("TITLE cannot be blank.");
            card.setTitle(t);
        }

        if (description != null) {
            card.setDescription(description.trim());
        }

        if (priority != null) {
            card.setPriority(priority);
        }

        if (assigneeUserId != null) {
            if (!userRepository.existsById(assigneeUserId)) {
                throw new NotFoundException("USER_NOT_FOUND", "Assignee with ID: " + assigneeUserId + " not found.");
            }

            card.setAssigneeUserId(assigneeUserId);
        }

        else {
            card.setAssigneeUserId(null);
        }

        card.setDueDate(dueDate);

        card.setVersion(card.getVersion() + 1);
        card.setUpdatedAt(Instant.now());

        Card saved = cardRepository.save(card);
        CardResponse res = toResponse(saved);

        var list = listRepository.findById(saved.getListId()).orElseThrow(
                () -> new IllegalStateException("List disappeared for card " + saved.getId())
        );

        publisher.enqueue(BoardEvent.of(list.getBoardId(), BoardEventType.CARD_UPDATED, new CardUpdatedData(res)));

        return res;
    }

    @Transactional
    public CardResponse moveCard(UUID cardId, UUID userId, UUID toListId, int toPosition, long expectedVersion) {
        UUID fromBoardId = authzLookup.requireWriteByCardId(cardId, userId);
        UUID toBoardId = authzLookup.requireWriteByListId(toListId, userId);

        if (!fromBoardId.equals(toBoardId)) {
            throw new IllegalArgumentException("Cannot move cards across boards!");
        }

        Card card = cardRepository.findById(cardId).orElseThrow(
                () -> new NotFoundException("CARD_NOT_FOUND", "Card with ID: " + cardId + " not found.")
        );

        if (card.getVersion() != expectedVersion) {
            throw new ConflictException(
                    "CARD_VERSION_CONFLICT",
                    "Card was updated elsewhere.",
                    toResponse(card)
            );
        }

        UUID fromListId = card.getListId();
        int fromPos = card.getPosition();

        var toList = (fromListId.equals(toListId)
                ? listRepository.findById(toListId)
                : listRepository.findByIdForUpdate(toListId)
        ).orElseThrow(() -> new NotFoundException("LIST_NOT_FOUND", "List with ID: " + toListId + " not found."));

        if (!fromListId.equals(toListId)) {
            Integer wip = toList.getWipLimit(); // nullable
            if (wip != null) {
                long destCount = cardRepository.countByListId(toListId);
                if (destCount >= wip) {
                    throw new WipLimitExceededException(wip);
                }
            }
        }

        long destCount = cardRepository.countByListId(toListId);
        int maxInsertPos = (int) destCount; // allow insert at end == destCount
        int toPos = Math.max(0, Math.min(toPosition, maxInsertPos));

        Instant now = Instant.now();
        long newVersion = card.getVersion() + 1;

        if (fromListId.equals(toListId)) {
            if (toPos == fromPos) return toResponse(card);

            cardRepository.setTempPosition(cardId, TEMP_POS);

            if (toPos > fromPos) {
                cardRepository.shiftLeftWithinList(fromListId, fromPos, toPos);
            } else {
                cardRepository.shiftRightWithinList(toListId, toPos, fromPos);
            }

            cardRepository.applyMove(cardId, toListId, toPos, newVersion, now);
        } else {
            cardRepository.setTempPosition(cardId, TEMP_POS);

            cardRepository.closeGapAfterRemoval(fromListId, fromPos);

            cardRepository.bumpRightPhase1(toListId, toPos, SHIFT_OFFSET);
            cardRepository.bumpRightPhase2(toListId, toPos, SHIFT_OFFSET);

            cardRepository.applyMove(cardId, toListId, toPos, newVersion, now);
        }

        Card moved = cardRepository.findById(cardId)
                .orElseThrow(() -> new IllegalStateException("Moved card disappeared!"));

        CardResponse res = toResponse(moved);

        publisher.enqueue(BoardEvent.of(
                toList.getBoardId(),
                BoardEventType.CARD_MOVED,
                new CardMovedData(res, fromListId, fromPos, toListId, toPos)
        ));

        return res;
    }

    private CardResponse toResponse(Card c) {
        return new CardResponse(
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
        );
    }

    @Transactional
    public void deleteCard(UUID cardId, UUID userId, long expectedVersion) {
        authzLookup.requireWriteByCardId(cardId, userId);

        Card card = cardRepository.findById(cardId).orElseThrow(
                () -> new NotFoundException("CARD_NOT_FOUND", "Card with ID: " + cardId + " not found.")
        );

        if (card.getVersion() != expectedVersion) {
            throw new ConflictException(
                    "CARD_VERSION_CONFLICT",
                    "Card was updated elsewhere.",
                    toResponse(card)
            );
        }

        UUID fromListId = card.getListId();
        int fromPos = card.getPosition();

        UUID boardId = cardRepository.findBoardIdByCardId(cardId)
                .orElseThrow(() -> new IllegalStateException("Board not found for card " + cardId));

        cardRepository.delete(card);
        cardRepository.closeGapAfterRemoval(fromListId, fromPos);

        publisher.enqueue(BoardEvent.of(
                boardId,
                BoardEventType.CARD_DELETED,
                new CardDeletedData(cardId, fromListId, fromPos)
        ));
    }

}
