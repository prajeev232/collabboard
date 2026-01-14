import { type BoardSnapshot, type Card } from "../types";

const sortByPos = (a: Card, b: Card) => {
    return a.position - b.position;
}

type CardPatch = Partial<Pick<Card, "title" | "description" | "priority" | "dueDate" | "assigneeUserId">>;

export const optimisticUpdateCard = (snap: BoardSnapshot, cardId: string, patch: CardPatch): BoardSnapshot => {
    const next: BoardSnapshot = {
        ...snap,
        cardsByListId: { ...snap.cardsByListId },
        lists: [...snap.lists]
    }

    for (const list of next.lists) {
        const cards = next.cardsByListId[list.id] ?? [];
        const index = cards.findIndex((c) => c.id === cardId);

        if (index != -1) {
            const old = cards[index];
            const updated: Card = {
                ...old,
                title: patch.title ?? old.title,
                description: patch.description ?? old.description,
                priority: patch.priority ?? old.priority,
                dueDate: patch.dueDate !== undefined ? patch.dueDate : old.dueDate,
                assigneeUserId: patch.assigneeUserId !== undefined ? patch.assigneeUserId : old.assigneeUserId
            };

            const copy = cards.slice();
            copy[index] = updated;
            copy.sort(sortByPos);
            next.cardsByListId[list.id] = copy;
            return next;
        }
    }

    return snap;
}

export const optimisticMoveCard = (snap: BoardSnapshot, cardId: string, toListId: string, toPosition: number): { next: BoardSnapshot; fromListId: string | null} => {
    const next: BoardSnapshot = {
        ...snap,
        cardsByListId: { ...snap.cardsByListId },
        lists: [...snap.lists]
    }

    let moving: Card | null = null;
    let fromListId: string | null = null;

    for (const list of next.lists) {
        const cards = next.cardsByListId[list.id] ?? [];
        const index = cards.findIndex((c) => c.id === cardId);

        if (index != -1) {
            moving = cards[index];
            fromListId = list.id;
            const remaining = cards.filter((c) => c.id !== cardId);
            next.cardsByListId[list.id] = remaining.map((c, i) => ({ ...c, position: i }));
            break;
        }
    }

    if (!moving) return {
        next: snap,
        fromListId: null
    }
    
    const dest = (next.cardsByListId[toListId] ?? []).slice();
    const insertAt = Math.max(0, Math.min(toPosition, dest.length));
    const movedCard: Card = { ...moving, listId: toListId, position: insertAt };
    dest.splice(insertAt, 0, movedCard);
    next.cardsByListId[toListId] = dest.map((c, i) => ({ ...c, position: i }));

    return { next, fromListId };
}

export const applyLatestCard = (snap: BoardSnapshot, latest: Card): BoardSnapshot => {
    const next: BoardSnapshot = {
        ...snap,
        cardsByListId: { ...snap.cardsByListId },
        lists: [...snap.lists]
    }

    for (const list of next.lists) {
        const cards = next.cardsByListId[list.id] ?? [];
        next.cardsByListId[list.id] = cards.filter((c) => c.id !== latest.id);
    }

    const dest = (next.cardsByListId[latest.listId] ?? []).slice();
    dest.push(latest);
    dest.sort((a, b) => a.position - b.position);
    next.cardsByListId[latest.listId] = dest;

    return next;
}

export const optimisticDeleteCard = (
  snap: BoardSnapshot,
  cardId: string
): { next: BoardSnapshot; deleted: Card | null } => {
  const next: BoardSnapshot = {
    ...snap,
    cardsByListId: { ...snap.cardsByListId },
    lists: [...snap.lists],
  };

  let deleted: Card | null = null;

  for (const list of next.lists) {
    const cards = next.cardsByListId[list.id] ?? [];
    const idx = cards.findIndex((c) => c.id === cardId);
    if (idx !== -1) {
      deleted = cards[idx];
      next.cardsByListId[list.id] = cards.filter((c) => c.id !== cardId).map((c, i) => ({ ...c, position: i }));
      break;
    }
  }

  return { next, deleted };
};
