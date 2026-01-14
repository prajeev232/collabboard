import type { CardPriority } from "../../api/cards";

export type Board = {
    id: string;
    name: string;
}

export type BoardList = {
    id: string;
    boardId: string;
    name: string;
    position: number;
    wipLimit?: number | null;
};

export type Card = {
    id: string;
    listId: string;
    title: string;
    description: string;
    position: number;
    version: number;
    updatedAt: string;
    priority: CardPriority;
    dueDate: string | null;
    createdByUserId: string;
    assigneeUserId: string | null;
}

export type BoardSnapshot = {
    board: Board;
    lists: BoardList[];
    cardsByListId: Record<string, Card[]>;
};