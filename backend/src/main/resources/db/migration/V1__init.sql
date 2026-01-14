CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS boards (
                                      id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         TEXT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE TABLE IF NOT EXISTS lists (
                                     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    board_id     UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    position     INT  NOT NULL CHECK (position >= 0),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE TABLE IF NOT EXISTS cards (
                                     id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id      UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    title        TEXT NOT NULL,
    description  TEXT NOT NULL DEFAULT '',
    position     INT  NOT NULL CHECK (position >= 0),
    version      BIGINT NOT NULL DEFAULT 1 CHECK (version >= 1),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );

CREATE UNIQUE INDEX IF NOT EXISTS ux_lists_board_position
    ON lists(board_id, position);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cards_list_position
    ON cards(list_id, position);

CREATE INDEX IF NOT EXISTS ix_lists_board
    ON lists(board_id);

CREATE INDEX IF NOT EXISTS ix_cards_list
    ON cards(list_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_cards_set_updated_at ON cards;

CREATE TRIGGER trg_cards_set_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
