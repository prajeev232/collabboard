import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getAccessToken } from '../../api/http';

type Unsub = () => void;

export const subscribeToBoardTopic = (params: {
    baseURL: string;
    boardId: string;
    onMessage: (rawJson: string) => void;
    onStatus?: (s: string) => void;
}): Unsub => {
    const { baseURL, boardId, onMessage, onStatus } = params;

    const token = getAccessToken();

    const client = new Client({
        webSocketFactory: () => new SockJS(`${baseURL}/ws`),
        connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        reconnectDelay: 2000,
        debug: () => {},
        onConnect: () => {
            onStatus?.("connected");
            client.subscribe(`/topic/boards/${boardId}`, (msg) => onMessage(msg.body));
        },
        onDisconnect: () => onStatus?.("disconnected"),
        onStompError: () => onStatus?.("stomp_error"),
        onWebSocketClose: () => onStatus?.("closed")
    });

    client.activate();

    return () => {
        try {
            client.deactivate();
        } catch {

        }
    }
}