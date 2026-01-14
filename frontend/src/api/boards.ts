import type { BoardSnapshot } from "../features/board/types";
import { apiFetch } from "./http";
import type { BoardRole } from "./members";

export type BoardResponse = {
  id: string;
  name: string;
  ownerName: string;
};

export type BoardRoleResponse = {
  role: BoardRole;
}

export const createBoard = async (name: string): Promise<BoardResponse> => {
  return apiFetch<BoardResponse>("/boards", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
};

export const getBoardSnapshot = async (boardId: string): Promise<BoardSnapshot> => {
  return apiFetch<BoardSnapshot>(`/boards/${boardId}`);
};

export const listBoards = async (): Promise<BoardResponse[]> => {
  return apiFetch<BoardResponse[]>("/boards");
}

export const getUserBoardRole = async (boardId: string): Promise<BoardRoleResponse> => {
  return apiFetch<BoardRoleResponse>(`/boards/${boardId}/me/role`);
}

export const deleteBoard = async (boardId: string): Promise<void> => {
  return apiFetch<void>(`/boards/${boardId}`, { method: "DELETE" });
};