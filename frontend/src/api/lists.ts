import { apiFetch } from "./http";

export type ListResponse = {
  id: string;
  boardId: string;
  name: string;
  position: number;
  wipLimit?: number | null;
};

export type CreateListPayload = {
  name: string;
  wipLimit?: number | null;
}

export const createList = async (boardId: string, payload: CreateListPayload): Promise<ListResponse> => {
  return apiFetch<ListResponse>(`/boards/${boardId}/lists`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const deleteList = async (listId: string): Promise<void> => {
  await apiFetch<void>(`/lists/${listId}`, { method: "DELETE" });
};
