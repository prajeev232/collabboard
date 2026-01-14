ALTER TABLE cards
    ADD COLUMN priority varchar(10) NOT NULL DEFAULT 'MEDIUM',
    ADD COLUMN due_date timestamptz NULL;

CREATE INDEX IF NOT EXISTS ix_cards_due_date ON cards(due_date);