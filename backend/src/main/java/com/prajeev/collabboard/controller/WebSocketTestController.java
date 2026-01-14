package com.prajeev.collabboard.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/debug/ws")
public class WebSocketTestController {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketTestController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping("/boards/{boardId}/ping")
    public Map<String, Object> ping(@PathVariable UUID boardId) {
        var payload = Map.<String, Object>of(
                "eventId", UUID.randomUUID().toString(),
                "ts", Instant.now().toString(),
                "boardId", boardId.toString(),
                "type", "DUMMY",
                "data", Map.of("message", "hello from server!")
        );

        messagingTemplate.convertAndSend("/topic/boards/" + boardId, Optional.of(payload));
        return payload;
    }
}
