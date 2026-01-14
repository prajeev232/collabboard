import { ApiError } from "./http";

type ApiErrorBody = {
  error?: string;
  message?: string;
  path?: string;
  ts?: string;
  fieldErrors?: Record<string, string> | null;
  details?: Record<string, any> | null;
};

export const getApiErrorMessage = (err: any): string => {
  // ✅ Your fetch wrapper throws ApiError(status, message, body)
  if (err instanceof ApiError) {
    const body = err.body as ApiErrorBody | string | null;

    if (body && typeof body === "object") {
      // Prefer message
      if (body.message) {
        if (body.error === "WIP_LIMIT_REACHED") {
          const limit = body.details?.limit;
          return limit ? `WIP limit reached (limit: ${limit}).` : body.message;
        }
        return body.message;
      }
    }

    // If backend returned a plain string body
    if (typeof body === "string") return body;

    // Fallback
    return err.message || `Request failed with status code ${err.status}.`;
  }

  // ✅ If any axios-ish errors still exist elsewhere
  const status = err?.response?.status;
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (typeof data === "string") return data;
  if (status) return `Request failed with status code ${status}.`;

  if (err?.message) return err.message;
  return "An unknown error occurred.";
};
