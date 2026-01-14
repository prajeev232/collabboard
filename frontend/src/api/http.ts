const TOKEN_KEY = "collab_access_token";

export const setAccessToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
}

export const clearAccessToken = () => {
    localStorage.removeItem(TOKEN_KEY);
}

export const getAccessToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
}

const apiBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
}

export class ApiError extends Error {
    status: number;
    body: any;

    constructor(status: number, message: string, body: any) {
        super(message);
        this.status = status;
        this.body = body;
    }
}

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const token = getAccessToken();

    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${apiBaseUrl()}${path}`, { ...options, headers });

    let body: any = null;
    const text = await res.text();
    if (text) {
        try {
            body = JSON.parse(text);
        } catch {
            body = text;
        }
    }

    if (!res.ok) {
        throw new ApiError(res.status, body?.message ?? res.statusText, body);
    }

    return body as T;
}