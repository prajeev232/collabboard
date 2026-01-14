package com.prajeev.collabboard.repository;

import com.prajeev.collabboard.domain.BoardMembership;
import com.prajeev.collabboard.domain.BoardMembershipId;
import com.prajeev.collabboard.domain.BoardRole;
import com.prajeev.collabboard.dto.BoardMemberResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BoardMembershipRepository extends JpaRepository<BoardMembership, BoardMembershipId> {
    List<BoardMembership> findByUserId(UUID userId);

    Optional<BoardMembership> findByBoardIdAndUserId(UUID boardId, UUID userId);

    boolean existsByBoardIdAndUserId(UUID boardId, UUID userId);

    @Query("""
        select new com.prajeev.collabboard.dto.BoardMemberResponse(
            u.id, u.email, u.displayName, m.role, m.createdAt
            ) from BoardMembership  m
                join User u on u.id = m.userId
                    where m.boardId = :boardId
                        order by m.createdAt asc
    """)
    List<BoardMemberResponse> listMembers(@Param("boardId") UUID boardId);

    @Query("select bm.role from BoardMembership bm where bm.boardId = :boardId and bm.userId = :userId")
    Optional<BoardRole> findRole(UUID boardId, UUID userId);


    interface BoardOwnerRow {
        UUID getBoardId();
        String getOwnerName();
    }

    @Query("""
        select m.boardId as boardId,
               coalesce(u.displayName, u.email) as ownerName
          from BoardMembership m
          join User u on u.id = m.userId
         where m.role = com.prajeev.collabboard.domain.BoardRole.OWNER
           and m.boardId in :boardIds
    """)
    List<BoardOwnerRow> findOwnersByBoardIds(@Param("boardIds") Collection<UUID> boardIds);
}
