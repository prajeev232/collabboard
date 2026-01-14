package com.prajeev.collabboard.realtime;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BoardEventBuffer {
    private BoardEventBuffer() {

    }

    static final ThreadLocal<List<BoardEvent<?>>> BUFFER = ThreadLocal.withInitial(() -> new ArrayList<>());

    static final ThreadLocal<UUID> TX_ID = new ThreadLocal<>();

    static UUID ensureTxId() {
        UUID id = TX_ID.get();
        if (id == null) {
            id = UUID.randomUUID();
            TX_ID.set(id);
        }

        return id;
    }

    static void clear() {
        BUFFER.remove();
        TX_ID.remove();
    }
}
