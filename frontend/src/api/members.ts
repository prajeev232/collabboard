import { apiFetch } from "./http";

export type BoardRole = "OWNER" | "EDITOR" | "VIEWER";

export type BoardMemberResponse = {
    userId: string;
    email: string;
    displayName: string | null;
    role: "OWNER" | "EDITOR" | "VIEWER";
    joinedAt: string;
};

export type UpdateBoardMemberRoleRequest = {
  role: Exclude<BoardRole, "OWNER">;
}

export const listBoardMembers = async (boardId: string): Promise<BoardMemberResponse[]> => {
    return apiFetch<BoardMemberResponse[]>(`/boards/${boardId}/members`);
};

export const updateBoardMemberRole = async (
    boardId: string,
    memberId: string,
    req: UpdateBoardMemberRoleRequest
): Promise<void> => {
    await apiFetch<void>(`/boards/${boardId}/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify(req)
    });
};

export const removeBoardMember = async (boardId: string, memberId: string): Promise<void> => {
    await apiFetch<void>(`/boards/${boardId}/members/${memberId}`, {
        method: "DELETE",
    });
};