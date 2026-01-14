package com.prajeev.collabboard.realtime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class BoardEventAfterCommitListener {
    private final SimpMessagingTemplate ws;

    public BoardEventAfterCommitListener(SimpMessagingTemplate ws) {
        this.ws = ws;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void afterCommit(AfterCommitEvent ignored) {
        try {
            for (var event : BoardEventBuffer.BUFFER.get()) {
                ws.convertAndSend("/topic/boards/" + event.boardId(), event);
            }
        }

        finally {
            BoardEventBuffer.clear();
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_ROLLBACK)
    public void afterRollback(AfterCommitEvent ignored) {
        BoardEventBuffer.clear();
    }
}
