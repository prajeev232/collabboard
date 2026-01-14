create table users (
                       id uuid primary key,
                       email varchar(255) not null unique,
                       password_hash varchar(255) not null,
                       display_name varchar(255),
                       created_at timestamptz not null default now()
);