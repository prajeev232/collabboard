ALTER TABLE lists
ADD COLUMN wip_limit integer null;

ALTER TABLE lists
ADD CONSTRAINT lists_wip_limit_positive CHECK (wip_limit IS NULL OR wip_limit > 0);
