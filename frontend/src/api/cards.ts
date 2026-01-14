import { apiFetch } from "./http";

export type CardPriority = "LOW" | "MEDIUM" | "HIGH";

export type CardResponse = {
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
};

export type UpdateCardRequest = {
  title?: string;
  description?: string;
  expectedVersion: number;
  priority: CardPriority;
  dueDate: string | null;
  assigneeUserId: string | null;
};

export type CreateCardRequest = {
  title?: string;
  description?: string;
  priority?: CardPriority;
  dueDate?: string | null;
  assigneeUserId?: string | null;
}

export type MoveCardRequest = {
  toListId: string;
  toPosition: number;
  expectedVersion: number;
};

export type DeleteCardRequest = {
  expectedVersion: number;
};

export const createCard = async (listId: string, req: CreateCardRequest): Promise<CardResponse> => {
  return apiFetch<CardResponse>(`/lists/${listId}/cards`, {
    method: "POST",
    body: JSON.stringify(req),
  });
};

export const updateCard = async (
  cardId: string,
  updates: UpdateCardRequest
): Promise<CardResponse> => {
  return apiFetch<CardResponse>(`/cards/${cardId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
};

export const moveCard = async (cardId: string, req: MoveCardRequest): Promise<CardResponse> => {
  return apiFetch<CardResponse>(`/cards/${cardId}/move`, {
    method: "POST",
    body: JSON.stringify(req),
  });
};

export const deleteCard = async (cardId: string, req: DeleteCardRequest): Promise<void> => {
  await apiFetch<void>(`/cards/${cardId}`, {
    method: "DELETE",
    body: JSON.stringify(req),
  });
};
