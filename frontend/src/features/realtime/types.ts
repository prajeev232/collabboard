import type { CardResponse } from "../../api/cards";
import type { ListResponse } from "../../api/lists";

export type BoardEventBase = {
  eventId: string;
  ts: string;
  boardId: string;
};

export type CardCreatedEvent = BoardEventBase & {
  type: "CARD_CREATED";
  data: { card: CardResponse };
};

export type CardUpdatedEvent = BoardEventBase & {
  type: "CARD_UPDATED";
  data: { card: CardResponse };
};

export type CardMovedEvent = BoardEventBase & {
  type: "CARD_MOVED";
  data: { card: CardResponse; fromListId: string };
};

export type ListCreatedEvent = BoardEventBase & {
  type: "LIST_CREATED";
  data: { list: ListResponse };
};

export type CardDeletedEvent = BoardEventBase & {
  type: "CARD_DELETED";
  data: { cardId: string; fromListId: string; fromPosition: number };
};

export type ListDeletedEvent = BoardEventBase & {
  type: "LIST_DELETED";
  data: { listId: string };
};

export type AnyBoardEvent =
  | CardCreatedEvent
  | CardUpdatedEvent
  | CardMovedEvent
  | CardDeletedEvent
  | ListCreatedEvent
  | ListDeletedEvent;

export type BoardEventType = AnyBoardEvent["type"];
