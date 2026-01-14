import axios from "axios";

export type ConflictResponse<T> = {
    code: string;
    message: string;
    latest: T;
};

export const isConflictError = (e: unknown): e is any => {
    return axios.isAxiosError(e) && e.response?.status === 409 && !!e.response.data;
}