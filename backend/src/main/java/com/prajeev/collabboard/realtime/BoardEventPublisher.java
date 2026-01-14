package com.prajeev.collabboard.realtime;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class BoardEventPublisher {
    private final ApplicationEventPublisher publisher;

    public BoardEventPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void enqueue(BoardEvent<?> event) {
        BoardEventBuffer.BUFFER.get().add(event);
        publisher.publishEvent(new AfterCommitEvent(BoardEventBuffer.ensureTxId()));
    }
}
