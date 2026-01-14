import { apiFetch, setAccessToken } from "./http";

export type RegisterRequest = {
    email: string;
    password: string;
    displayName?: string | null;
}

export type LoginRequest = {
    email: string;
    password: string;
}

export type AuthUser = {
    id: string;
    email: string;
    displayName?: string | null;
}

export type LoginResponse = {
    ok: boolean;
    user: AuthUser;
    accessToken: string;
}

export const register = async (req: RegisterRequest) => {
    return apiFetch<AuthUser>(`/auth/register`, {
        method: "POST",
        body: JSON.stringify(req)
    });
}

export const login = async (req: LoginRequest) => {
    const res = await apiFetch<LoginResponse>(`/auth/login`, {
        method: "POST",
        body: JSON.stringify(req),
    });

    setAccessToken(res.accessToken);
    return res;
}

