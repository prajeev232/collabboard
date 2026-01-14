import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AppShellTemplate from "../components/templates/AppShellTemplate";
import { useNavigate, useParams } from "react-router-dom";
import useBoardSnapshot from "../features/board/hooks/useBoardSnapshot";
import BoardTemplate from "../components/templates/BoardTemplate";
import ListsRow from "../components/organisms/ListsRow";
import ListColumn from "../components/organisms/ListColumn";
import { useEffect, useMemo, useState } from "react";
import EmptyCards from "../components/molecules/EmptyCard";
import { createList, deleteList } from "../api/lists";
import { getApiErrorMessage } from "../api/errors";
import { createCard, deleteCard, moveCard, updateCard, type CardPriority } from "../api/cards";
import {
  applyLatestCard,
  optimisticDeleteCard,
  optimisticMoveCard,
  optimisticUpdateCard,
} from "../features/board/reducer/optimistic";
import { isConflictError, type ConflictResponse } from "../api/conflicts";
import type { BoardSnapshot, Card } from "../features/board/types";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableCard from "../components/molecules/DraggableCard";
import CardPreview from "../components/molecules/CardPreview";
import BoardMembersPanel from "../components/organisms/BoardMembersPanel";
import BoardInvitesPanel from "../components/organisms/BoardInvitesPanel";
import type { BoardRole, BoardMemberResponse } from "../api/members";
import { deleteBoard, getUserBoardRole } from "../api/boards";
import { listBoardMembers } from "../api/members";
import EditCardDialog from "../components/organisms/EditCardDialog";
import CardDetailsDialog from "../components/organisms/CardDetailsDialog";
import CreateCardDialog from "../components/organisms/CreateCardDialog";

const BoardPage = () => {
  const { boardId } = useParams();
  const nav = useNavigate();

  const { data, loading, error, reload, setData } = useBoardSnapshot(boardId);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [tab, setTab] = useState(0);
  const [myRole, setMyRole] = useState<BoardRole | null>(null);

  const [members, setMembers] = useState<BoardMemberResponse[]>([]);

  const canWrite = myRole === "OWNER" || myRole === "EDITOR";
  const isOwner = myRole === "OWNER";

  const [createForListId, setCreateForListId] = useState<string | null>(null);

  // ✅ Board menu + delete confirm
  const [boardMenuAnchor, setBoardMenuAnchor] = useState<null | HTMLElement>(null);
  const boardMenuOpen = Boolean(boardMenuAnchor);

  const [confirmDeleteBoardOpen, setConfirmDeleteBoardOpen] = useState(false);
  const [deletingBoard, setDeletingBoard] = useState(false);

  const openBoardMenu = (e: React.MouseEvent<HTMLElement>) => setBoardMenuAnchor(e.currentTarget);
  const closeBoardMenu = () => setBoardMenuAnchor(null);

  const onClickDeleteBoard = () => {
    closeBoardMenu();
    setConfirmDeleteBoardOpen(true);
  };

  const handleDeleteBoard = async () => {
    if (!boardId) return;

    try {
      setDeletingBoard(true);
      await deleteBoard(boardId);
      setToast("Board deleted");
      nav("/"); // ✅ your home route
    } catch (e: any) {
      setToast(getApiErrorMessage(e));
    } finally {
      setDeletingBoard(false);
      setConfirmDeleteBoardOpen(false);
    }
  };

  // --- role ---
  useEffect(() => {
    if (!boardId) return;

    getUserBoardRole(boardId)
      .then((r) => setMyRole(r.role))
      .catch((e) => setToast(getApiErrorMessage(e)));
  }, [boardId]);

  useEffect(() => {
    if (!isOwner && tab === 2) setTab(0);
  }, [isOwner, tab]);

  // --- members (for created-by / assignee display + dropdown) ---
  useEffect(() => {
    if (!boardId) return;

    listBoardMembers(boardId)
      .then(setMembers)
      .catch((e) => setToast(getApiErrorMessage(e)));
  }, [boardId]);

  const nameByUserId = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of members) {
      const name = u.displayName && u.displayName.trim() ? u.displayName : u.email;
      m.set(u.userId, name);
    }
    return m;
  }, [members]);

  // --- selected card ---
  const selectedCard = useMemo(() => {
    if (!data || !selectedCardId) return null;
    for (const list of data.lists) {
      const cards = data.cardsByListId[list.id] ?? [];
      const found = cards.find((c) => c.id === selectedCardId);
      if (found) return found;
    }
    return null;
  }, [data, selectedCardId]);

  const getListById = (listId: string) => data?.lists.find((l) => l.id === listId) ?? null;

  const getWipLimit = (listId: string) => {
    const l = getListById(listId);
    return l?.wipLimit ?? null;
  };

  const getCardCount = (listId: string) => data?.cardsByListId[listId]?.length ?? 0;

  const wouldExceedWip = (listId: string, incomingDelta: number) => {
    const limit = getWipLimit(listId);
    if (limit === null || limit === undefined) return false;
    const count = getCardCount(listId);
    return count + incomingDelta > limit;
  };

  // --- actions ---
  const handleAddList = async (payload: { name: string; wipLimit?: number | null }) => {
    if (!boardId) return;

    try {
      await createList(boardId, payload);
      setToast("List created successfully");
    } catch (e: any) {
      setToast(getApiErrorMessage(e));
    }
  };

  const findCardInState = (snap: BoardSnapshot, cardId: string) => {
    for (const list of snap.lists) {
      const cards = snap.cardsByListId[list.id] ?? [];
      const found = cards.find((c: any) => c.id === cardId);
      if (found) return found;
    }
    return null;
  };

  const handleMoveCard = async (cardId: string, toListId: string, toPosition: number) => {
    if (!data) return;

    const movingCard = findCardInState(data, cardId);
    if (!movingCard) return;

    const fromListId = movingCard.listId;

    if (fromListId !== toListId && wouldExceedWip(toListId, 1)) {
      const limit = getWipLimit(toListId);
      setToast(`WIP limit reached (limit: ${limit})`);
      return;
    }

    const before = data;
    const { next } = optimisticMoveCard(before, cardId, toListId, toPosition);
    setData(next);

    try {
      const moved = await moveCard(cardId, {
        toListId,
        toPosition,
        expectedVersion: movingCard.version,
      });

      setData((prev) => (prev ? applyLatestCard(prev, moved as any) : prev));
    } catch (e: any) {
      if (isConflictError(e)) {
        const conflict = e.response.data as ConflictResponse<Card>;
        setToast(conflict.message || "Updated elsewhere");
        setData((prev) => (prev ? applyLatestCard(prev, conflict.latest as any) : prev));
        return;
      }

      setData(before);
      setToast(getApiErrorMessage(e));
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    if (!data) return;

    const { active, over } = e;
    if (!over) return;

    const activeData = active.data.current as any;
    const overData = over.data.current as any;

    if (!activeData || activeData.type !== "CARD") return;

    const cardId = activeData.cardId as string;
    const fromListId = activeData.listId as string;

    // destination list
    let toListId: string | null = null;
    if (overData?.type === "CARD") toListId = overData.listId;
    else if (overData?.type === "LIST") toListId = overData.listId;
    if (!toListId) return;

    // target position
    const toCards = data.cardsByListId[toListId] ?? [];
    let toPosition = toCards.length;

    if (overData?.type === "CARD") {
      const overCardId = overData.cardId as string;
      const idx = toCards.findIndex((c) => c.id === overCardId);
      if (idx !== -1) {
        toPosition = idx;

        if (fromListId === toListId) {
          const fromIdx = toCards.findIndex((c) => c.id === cardId);
          if (fromIdx === toPosition) return;
        }
      }
    }

    if (fromListId === toListId && active.id === over.id) return;

    handleMoveCard(cardId, toListId, toPosition);
  };

  const handleSaveCard = async (payload: {
    title: string;
    description: string;
    priority: CardPriority;
    dueDate: string | null;
    expectedVersion: number;
    assigneeUserId: string | null;
  }) => {
    if (!selectedCard || !data) return;

    const before = data;

    setData(
      optimisticUpdateCard(before, selectedCard.id, {
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        dueDate: payload.dueDate,
        assigneeUserId: payload.assigneeUserId,
      })
    );

    try {
      const saved = await updateCard(selectedCard.id, payload);
      setData((prev) => (prev ? applyLatestCard(prev, saved as any) : prev));
      setToast("Card updated successfully");
      setEditOpen(false);
    } catch (e: any) {
      if (isConflictError(e)) {
        const conflict = e.response.data as ConflictResponse<Card>;
        setToast(conflict.message || "Updated elsewhere");
        setData((prev) => (prev ? applyLatestCard(prev, conflict.latest as any) : prev));
        return;
      }

      setData(before);
      setToast(getApiErrorMessage(e));
    }
  };

  const handleDeleteCard = async () => {
    if (!data || !selectedCard) return;

    const before = data;
    const { next } = optimisticDeleteCard(before, selectedCard.id);
    setData(next);

    try {
      await deleteCard(selectedCard.id, { expectedVersion: selectedCard.version });
      setToast("Card deleted");
      setSelectedCardId(null);
      setEditOpen(false);
    } catch (e: any) {
      if (isConflictError(e)) {
        const conflict = e.response.data as ConflictResponse<Card>;
        setToast(conflict.message || "Updated elsewhere");
        setData((prev) => (prev ? applyLatestCard(prev, conflict.latest as any) : prev));
        return;
      }
      setData(before);
      setToast(getApiErrorMessage(e));
    }
  };

  const removeListOptimistically = (snap: BoardSnapshot, listId: string): BoardSnapshot => {
    const next: BoardSnapshot = {
      ...snap,
      lists: snap.lists.filter((l) => l.id !== listId),
      cardsByListId: { ...snap.cardsByListId },
    };

    delete next.cardsByListId[listId];
    return next;
  };

  const handleDeleteList = async (listId: string) => {
    if (!data) return;

    const currentSelected = selectedCard;
    if (currentSelected?.listId === listId) {
      setSelectedCardId(null);
      setEditOpen(false);
    }

    const before = data;
    setData(removeListOptimistically(before, listId));

    try {
      await deleteList(listId);
      setToast("List deleted");
    } catch (e: any) {
      setData(before);
      setToast(getApiErrorMessage(e));
    }
  };

  // --- details dialog helpers ---
  const selectedListName = selectedCard ? getListById(selectedCard.listId)?.name ?? null : null;

  const createdByName = selectedCard
    ? nameByUserId.get((selectedCard as any).createdByUserId) ?? "Unknown"
    : "Unknown";

  const assigneeName =
    selectedCard && (selectedCard as any).assigneeUserId
      ? nameByUserId.get((selectedCard as any).assigneeUserId) ?? "Unknown"
      : null;

  return (
    <AppShellTemplate title="CollabBoard">
      <BoardTemplate boardName={data?.board.name} loading={loading} error={error} onRefresh={reload}>
        {boardId && (
          <>
            {/* ✅ Tabs + owner menu */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                <Tab label="Board" />
                <Tab label="Members" />
                {isOwner && <Tab label="Invites" />}
              </Tabs>

              {isOwner && (
                <>
                  <IconButton onClick={openBoardMenu}>
                    <MoreHorizIcon />
                  </IconButton>

                  <Menu anchorEl={boardMenuAnchor} open={boardMenuOpen} onClose={closeBoardMenu}>
                    <MenuItem onClick={onClickDeleteBoard} sx={{ color: "error.main", fontWeight: 800 }}>
                      Delete board
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>

            {tab === 1 && <BoardMembersPanel boardId={boardId} myRole={myRole} onToast={setToast} />}
            {isOwner && tab === 2 && <BoardInvitesPanel boardId={boardId} onToast={setToast} />}
          </>
        )}

        {tab === 0 && data && (
          canWrite ? (
            <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <Box sx={{ position: "relative", height: "100%" }}>
                <ListsRow onAddList={handleAddList}>
                  {data.lists.map((list) => {
                    const cards = data.cardsByListId[list.id] ?? [];
                    const cardIds = cards.map((c) => c.id);

                    const subtitle =
                      list.wipLimit != null ? `WIP ${getCardCount(list.id)}/${list.wipLimit}` : undefined;

                    return (
                      <ListColumn
                        key={list.id}
                        listId={list.id}
                        title={list.name}
                        subtitle={subtitle}
                        canDelete={canWrite}
                        onDelete={handleDeleteList}
                      >
                        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                          {cards.length === 0 ? (
                            <EmptyCards />
                          ) : (
                            cards.map((c) => (
                              <DraggableCard
                                key={c.id}
                                cardId={c.id}
                                listId={list.id}
                                title={c.title}
                                description={c.description}
                                priority={c.priority}
                                dueDate={c.dueDate}
                                onClick={() => {
                                  setSelectedCardId(c.id);
                                  setEditOpen(false);
                                }}
                              />
                            ))
                          )}
                        </SortableContext>

                        <Button
                          variant="text"
                          onClick={() => setCreateForListId(list.id)}
                          disabled={wouldExceedWip(list.id, 1)}
                          sx={{ justifyContent: "flex-start", textTransform: "none", width: "100%", fontWeight: 700 }}
                        >
                          + Add card
                        </Button>
                      </ListColumn>
                    );
                  })}
                </ListsRow>
              </Box>
            </DndContext>
          ) : (
            <ListsRow>
              {data.lists.map((list) => {
                const cards = data.cardsByListId[list.id] ?? [];

                return (
                  <ListColumn key={list.id} listId={list.id} title={list.name} subtitle={`pos ${list.position}`}>
                    {cards.length === 0 ? (
                      <EmptyCards />
                    ) : (
                      cards.map((c) => (
                        <CardPreview
                          key={c.id}
                          title={c.title}
                          description={c.description}
                          priority={c.priority}
                          dueDate={c.dueDate}
                          onClick={() => {
                            setSelectedCardId(c.id);
                            setEditOpen(false);
                          }}
                        />
                      ))
                    )}
                  </ListColumn>
                );
              })}
            </ListsRow>
          )
        )}

        <Snackbar
          open={!!toast}
          autoHideDuration={2500}
          onClose={() => setToast(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setToast(null)} severity="info" sx={{ width: "100%" }}>
            {toast}
          </Alert>
        </Snackbar>

        {/* ✅ Card details */}
        <CardDetailsDialog
          open={!!selectedCard}
          card={selectedCard}
          canEdit={canWrite}
          listName={selectedListName}
          createdByName={createdByName}
          assigneeName={assigneeName}
          onClose={() => {
            setSelectedCardId(null);
            setEditOpen(false);
          }}
          onEdit={() => setEditOpen(true)}
          onDelete={canWrite ? handleDeleteCard : undefined}
        />

        {/* ✅ Card edit */}
        <EditCardDialog
          open={!!selectedCard && editOpen}
          card={selectedCard}
          canEdit={canWrite}
          members={members.map((m) => ({ userId: m.userId, displayName: m.displayName, email: m.email }))}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveCard}
        />

        {/* ✅ Create card */}
        <CreateCardDialog
          open={!!createForListId}
          canEdit={canWrite}
          members={members.map((m) => ({ userId: m.userId, displayName: m.displayName, email: m.email }))}
          onClose={() => setCreateForListId(null)}
          onCreate={async (payload) => {
            if (!createForListId) return;

            if (wouldExceedWip(createForListId, 1)) {
              setToast(`WIP limit reached (limit: ${getWipLimit(createForListId)})`);
              return;
            }

            try {
              await createCard(createForListId, payload);
              setToast("Card created successfully");
              setCreateForListId(null);
            } catch (e: any) {
              setToast(getApiErrorMessage(e));
            }
          }}
        />

        {/* ✅ Confirm delete board */}
        <Dialog
          open={confirmDeleteBoardOpen}
          onClose={deletingBoard ? undefined : () => setConfirmDeleteBoardOpen(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle>Delete board?</DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 2 }}>
            <Typography>
              This will permanently delete <b>{data?.board.name ?? "this board"}</b>, all lists, and all cards.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDeleteBoardOpen(false)} disabled={deletingBoard}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteBoard} disabled={deletingBoard}>
              {deletingBoard ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>
      </BoardTemplate>
    </AppShellTemplate>
  );
};

export default BoardPage;
