alter table cards
    add column created_by uuid not null,
    add column assignee_user_id uuid null;

alter table cards
    add constraint fk_cards_created_by foreign key (created_by) references users(id),
    add constraint fk_cards_assignee foreign key (assignee_user_id) references users(id);
