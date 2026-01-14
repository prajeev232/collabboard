import type { AnyBoardEvent, CardMovedData } from "../../realtime/types";
import type { BoardSnapshot, Card } from "../types";

const upsertInCardList = (cards: Card[], card: Card) => {
    const index = cards.findIndex((c) => c.id === card.id);
    if (index === -1) return [...cards, card].sort((a, b) => a.position - b.position);

    const next = cards.slice();
    next[index] = card;
    next.sort((a, b) => a.position - b.position);
    return next;
}

const removeCardFromList = (cards: Card[], cardId: string): Card[] => {
    return cards.filter((c) => c.id !== cardId);
}

export const applyEvent = (state: BoardSnapshot, event: AnyBoardEvent): BoardSnapshot => {
    if (event.boardId !== state.board.id) return state;

    const next: BoardSnapshot = {
        ...state,
        cardsByListId: { ...state.cardsByListId },
        lists: [...state.lists],
    };

    if (event.type === "CARD_CREATED") {
        const card = event.data.card;
        const listCards = next.cardsByListId[card.listId] ?? [];
        next.cardsByListId[card.listId] = upsertInCardList(listCards, card);
        return next;
    }

    if (event.type === "CARD_UPDATED") {
        const card = event.data.card;
        const listCards = next.cardsByListId[card.listId] ?? [];
        next.cardsByListId[card.listId] = upsertInCardList(listCards, card);
        return next;
    }

    if (event.type === "CARD_MOVED") {
        const { card, fromListId } = event.data as CardMovedData;

        const fromCards = next.cardsByListId[fromListId] ?? [];
        next.cardsByListId[fromListId] = removeCardFromList(fromCards, card.id);

        const toCards = next.cardsByListId[card.listId] ?? [];
        next.cardsByListId[card.listId] = upsertInCardList(toCards, card);

        return next;
    }

    if (event.type === "CARD_DELETED") {
        const { cardId, fromListId } = event.data;
        const fromCards = next.cardsByListId[fromListId] ?? [];
        next.cardsByListId[fromListId] = fromCards.filter((c) => c.id !== cardId);
        return next;
    }

    if (event.type === 'LIST_CREATED') {
        const list = event.data.list;

        const index = next.lists.findIndex((l) => l.id === list.id);
        if (index === -1) next.lists.push(list);
        else next.lists[index] = list;

        next.lists.sort((a, b) => a.position - b.position);

        if (!next.cardsByListId[list.id]) next.cardsByListId[list.id] = [];

        return next;
    }

    if (event.type === "LIST_DELETED") {
        const { listId } = event.data as { listId: string };

        next.lists = next.lists.filter((l) => l.id !== listId);
        const copy = { ...next.cardsByListId };
        delete copy[listId];
        next.cardsByListId = copy;

        return next;
    }

    return state;
}