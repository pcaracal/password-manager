-- Your SQL goes here
create table user
(
    id       integer primary key autoincrement,
    username text not null,
    password text not null
);

insert into user (username, password)
values ('admin', '$argon2id$v=19$m=19456,t=2,p=1$C0Nlt9bK2+C3sXwQa4Yx8A$pSAXEJoPLOxZNSv+kVocFnH58FRrvggugLDpTABTzYc');