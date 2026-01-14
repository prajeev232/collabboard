package com.prajeev.collabboard.realtime;

import java.time.Instant;
import java.util.UUID;

public record BoardEvent<T>(
        UUID eventId,
        Instant ts,
        UUID boardId,
        BoardEventType type,
        T data) {
    public static <T> BoardEvent<T>of(UUID boardId, BoardEventType type, T data) {
        return new BoardEvent<>(UUID.randomUUID(), Instant.now(), boardId, type, data);
    }
}
