alter table board_memberships
add constraint board_memberships_role_check
check (role in ('OWNER', 'EDITOR', 'VIEWER'));

create index if not exists idx_board_memberships_user_id on board_memberships(user_id);
create index if not exists idx_board_memberships_board_id on board_memberships(board_id);