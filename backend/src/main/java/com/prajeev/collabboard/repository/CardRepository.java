package com.prajeev.collabboard.repository;

import com.prajeev.collabboard.domain.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByListIdOrderByPositionAsc(UUID listId);

    List<Card> findByListIdInOrderByListIdAscPositionAsc(Collection<UUID> listIds);

    long countByListId(UUID listId);

    @Query("select coalesce(max(c.position), -1) from Card c where c.listId = :listId")
    int maxPositionBylistId(UUID listId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Card c
            set c.position = c.position + 1
            where c.listId = :listId
            and c.position >= :fromPos
    """)
    int bumpPositionsRight(UUID listId, int fromPos);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Card c
           set c.position = c.position - 1
         where c.listId = :listId
           and c.position > :fromPos
           and c.position <= :toPos
    """)
    int shiftLeftWithinList(UUID listId, int fromPos, int toPos);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Card c
           set c.position = c.position + 1
         where c.listId = :listId
           and c.position >= :toPos
           and c.position < :fromPos
    """)
    int shiftRightWithinList(UUID listId, int toPos, int fromPos);

    // When moving out of a list: close the gap for all positions > oldPos
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Card c
           set c.position = c.position - 1
         where c.listId = :listId
           and c.position > :oldPos
    """)
    int closeGapAfterRemoval(UUID listId, int oldPos);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
        update Card c
           set c.listId = :toListId,
               c.position = :toPos,
               c.version = :newVersion,
               c.updatedAt = :updatedAt
         where c.id = :cardId
    """)
    int applyMove(UUID cardId, UUID toListId, int toPos, long newVersion, Instant updatedAt);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
    update Card c
       set c.position = :tempPos
     where c.id = :cardId
""")
    int setTempPosition(UUID cardId, int tempPos);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
    update Card c
       set c.position = c.position + :offset
     where c.listId = :listId
       and c.position >= :fromPos
""")
    int bumpRightPhase1(UUID listId, int fromPos, int offset);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
    update Card c
       set c.position = c.position - (:offset - 1)
     where c.listId = :listId
       and c.position >= (:fromPos + :offset)
""")
    int bumpRightPhase2(UUID listId, int fromPos, int offset);

    @Query("""
        select l.boardId
            from Card c
                join BoardList l on l.id = c.listId
                    where c.id = :cardId
    """)
    Optional<UUID> findBoardIdByCardId(UUID cardId);
}
