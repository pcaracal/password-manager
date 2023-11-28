-- Your SQL goes here
create table data
(
    id           integer primary key autoincrement,
    fk_user_id   integer not null,
    name         text    not null,
    username     text    not null,
    password     text    not null,
    created_at   bigint,
    updated_at   bigint,
    url          text,
    notes        text,
    fk_folder_id integer,
    foreign key (fk_user_id) references user (id),
    foreign key (fk_folder_id) references folder (id)
);