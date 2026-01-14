create table board_invites (
    id uuid primary key,
    board_id uuid not null references boards(id) on delete cascade,
    email text not null,
    role varchar(20) not null,
    token_hash text not null,
    status varchar(20) not null,
    expires_at timestamptz not null,
    created_at timestamptz not null,
    created_by uuid references users(id) on delete cascade,
    accepted_at timestamptz null,
    accepted_by uuid null references users(id) on delete set null
);

create index idx_board_invites_board_email on board_invites(board_id, email);
create index idx_board_invites_token_hash on board_invites(token_hash);

alter table board_invites
    add constraint board_invites_role_check
    check (role in ('VIEWER', 'EDITOR'));

alter table board_invites
    add constraint board_invites_status_check
    check (status in ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED'));