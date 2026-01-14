package com.prajeev.collabboard.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Card {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "list_id", nullable = false, columnDefinition = "uuid")
    private UUID listId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private long version;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CardPriority priority = CardPriority.MEDIUM;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "created_by", columnDefinition = "uuid")
    private UUID createdByUserId;

    @Column(name = "assignee_user_id", columnDefinition = "uuid")
    private UUID assigneeUserId;
}
