-- Your SQL goes here
create table user
(
    id       integer primary key autoincrement,
    username text not null,
    password text not null
);

insert into user (username, password)
values ('admin', '$argon2id$v=19$m=19456,t=2,p=1$4rOtUTyQiq6PUlOvMx7V9g$dCrATPxx++u8B9FAuQEOe4ZdT1M1xXt9fnFoap1IXKA');