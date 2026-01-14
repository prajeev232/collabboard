package com.prajeev.collabboard.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "lists")
public class BoardList {
    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "board_id", nullable = false, columnDefinition = "uuid")
    private UUID boardId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private int position;

    @Column(name = "wip_limit")
    private Integer wipLimit;

    protected BoardList() {}

    public BoardList(UUID id, UUID boardId, String name, int position, Integer wipLimit) {
        this.id = id;
        this.boardId = boardId;
        this.name = name;
        this.position = position;
        this.wipLimit = wipLimit;
    }

    public UUID getId() {
        return id;
    }

    public UUID getBoardId() {
        return boardId;
    }

    public String getName() {
        return name;
    }

    public int getPosition() {
        return position;
    }

    public Integer getWipLimit() {
        return wipLimit;
    }
}
