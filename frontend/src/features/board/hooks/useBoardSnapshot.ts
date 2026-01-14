import { useCallback, useEffect, useRef, useState } from "react";
import type { BoardSnapshot } from "../types";
import { getBoardSnapshot } from "../../../api/boards";
import { getApiErrorMessage } from "../../../api/errors";
import { subscribeToBoardTopic } from "../../realtime/webSocketClient";
import type { AnyBoardEvent } from "../../realtime/types";
import { applyEvent } from "../reducer/applyEvent";
import { ApiError } from "../../../api/http";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

const useBoardSnapshot = (boardId: string | undefined) => {
    const [data, setData] = useState<BoardSnapshot | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const unsubRef = useRef<null | (() => void)>(null);

    const load = useCallback(async () => {
        if (!boardId) return;
        setError(null);
        setLoading(true);

        try {
            const snap = await getBoardSnapshot(boardId);
            setData(snap);
        }

        catch (e: unknown) {
            if (e instanceof ApiError && e.status === 401) {
                window.location.href = "/login";
                return;
            }

            setError(getApiErrorMessage(e));
            setData(null);
        }

        finally {
            setLoading(false);
        }
    }, [boardId]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        unsubRef.current?.();
        unsubRef.current = null;

        if (!boardId) return;

        unsubRef.current = subscribeToBoardTopic({
            baseURL: API_BASE_URL,
            boardId,
            onMessage: (raw) => {
                try {
                    const evt = JSON.parse(raw) as AnyBoardEvent;
                    setData((prev) => (prev ? applyEvent(prev, evt) : prev));
                }

                catch (e) {
                    console.log("WebSocket message parsing error: ", e);
                }
            }
        });

        return () => {
            unsubRef.current?.();
            unsubRef.current = null;
        }
    }, [boardId]);

    return { data, loading, error, setData, reload: load };
};

export default useBoardSnapshot;