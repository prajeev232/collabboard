package com.prajeev.collabboard.realtime;

import com.prajeev.collabboard.dto.CardResponse;

import java.util.UUID;

public record CardMovedData(CardResponse card,
                            UUID fromListId,
                            int fromPosition,
                            UUID toListId,
                            int toPosition) {

}
