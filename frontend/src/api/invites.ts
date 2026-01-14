import { apiFetch } from "./http";

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
export type InviteRole = "VIEWER" | "EDITOR";
export type BoardRole = "VIEWER" | "EDITOR";

export type InviteListResponse = {
    id: string;
    boardId: string;
    email: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
    status: InviteStatus;
    expiresAt: string;
    createdAt: string;
    createdBy: string;
};

export type InvitePreviewResponse = {
    boardId: string;
    boardName: string;
    email: string;
    role: "OWNER" | "EDITOR" | "VIEWER";
    status: InviteStatus;
    expiresAt: string;
}

export type CreateInviteRequest = {
    email: string;
    role: InviteRole;
};

export const createInvite = async (boardId: string, req: CreateInviteRequest): Promise<InviteListResponse> => {
    return apiFetch<InviteListResponse>(`/boards/${boardId}/invites`, {
        method: "POST",
        body: JSON.stringify(req)
    });
};

export const listInvites = async (boardId: string, status: InviteStatus = "PENDING"): Promise<InviteListResponse[]> => {
    return apiFetch<InviteListResponse[]>(`/boards/${boardId}/invites?status=${status}`);
}

export const getInvitePreview = async (token: string): Promise<InvitePreviewResponse> => {
  return apiFetch<InvitePreviewResponse>(`/invites/${token}`);
};

export const acceptInvite = async (token: string): Promise<{ boardId: string }> => {
  return apiFetch<{ boardId: string }>(`/invites/accept`, {
    method: "POST",
    body: JSON.stringify({ token })
  });
};