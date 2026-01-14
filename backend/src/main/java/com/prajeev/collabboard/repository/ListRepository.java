package com.prajeev.collabboard.repository;

import com.prajeev.collabboard.domain.Board;
import com.prajeev.collabboard.domain.BoardList;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ListRepository extends JpaRepository<BoardList, UUID> {
    List<BoardList> findByBoardIdOrderByPositionAsc(UUID boardId);

    @Query("select l.boardId from BoardList l where l.id = :listId")
    Optional<UUID> findBoardIdByListId(@Param("listId") UUID listId);

    @Query("select coalesce(max(l.position), -1) from BoardList l where l.boardId = :boardId")
    int maxPositionByBoardId(UUID boardId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select l from BoardList l where l.id = :listId")
    Optional<BoardList> findByIdForUpdate(@Param("listId") UUID listId);
}
