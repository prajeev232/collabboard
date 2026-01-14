DO $$
BEGIN
    -- V1 created a unique index ux_cards_list_position(list_id, position)
    -- V2 added a UNIQUE constraint uq_cards_list_position(list_id, position) which creates its own unique index.
    -- Keeping both is redundant (extra write overhead + potential confusion).
    IF EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = current_schema()
          AND indexname = 'ux_cards_list_position'
    ) THEN
        DROP INDEX ux_cards_list_position;
    END IF;
END $$;
