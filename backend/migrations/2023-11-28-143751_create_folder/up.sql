-- Your SQL goes here
create table folder
(
    id         integer primary key autoincrement,
    fk_user_id integer not null,
    name       text    not null
);
