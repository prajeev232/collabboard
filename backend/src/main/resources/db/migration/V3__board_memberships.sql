create table board_memberships(
    board_id uuid not null references boards(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(20) not null,
    created_at timestamptz not null default now(),
    primary key (board_id, user_id)
);