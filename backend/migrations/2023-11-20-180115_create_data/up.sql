-- Your SQL goes here
create table data
(
    id         integer primary key autoincrement,
    fk_user_id integer not null,
    name       text    not null,
    username   text    not null,
    password   text    not null,
    created_at integer not null,
    updated_at integer not null,
    url        text,
    notes      text,
    foreign key (fk_user_id) references user (id)
);

insert into data (fk_user_id, name, username, password, created_at, updated_at, url, notes)
values (1, 'Google', 'user', 'pass', 1234567890, 1234567890, 'http://www.google.com', 'Google is a search engine');