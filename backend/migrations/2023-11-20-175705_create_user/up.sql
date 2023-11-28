-- Your SQL goes here
create table user
(
    id       integer primary key autoincrement,
    username text not null,
    password text not null
);