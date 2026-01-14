package com.prajeev.collabboard.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record BoardSnapshotResponse(BoardResponse board,
                                    List<ListResponse> lists,
                                    Map<UUID, List<CardResponse>> cardsByListId) {

}
