package com.prajeev.collabboard.realtime;

import java.util.UUID;

public record CardDeletedData(UUID cardId, UUID fromListId, int fromPosition) {
}
