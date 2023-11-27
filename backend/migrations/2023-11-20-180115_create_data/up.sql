-- Your SQL goes here
create table data
(
    id         integer primary key autoincrement,
    fk_user_id integer not null,
    name       text    not null,
    username   text    not null,
    password   text    not null,
    created_at bigint,
    updated_at bigint,
    url        text,
    notes      text,
    foreign key (fk_user_id) references user (id)
);

insert into data (fk_user_id, name, username, password, created_at, updated_at, url, notes)
values (1,
        'U2FsdGVkX19pgltZJtyDm1mIUjpB6guWENTcWZxz0JvLVAgz3ED7MPdh3CgUDrN2fiqNGej8cYRKO9maZ+lrC3pcJNeHwTZdCvwpdx1M609xNWccScd8DYzSx9O+LK+yokRnXLFniv87ryc9K2/eF1ecZsCpSWnfm+bo/LZwWSmJ6UauTES1yhKQ5yNRdWnsy3WySdGamrBfqdINb69/Qg==',
        'U2FsdGVkX19pgltZJtyDm1mIUjpB6guWENTcWZxz0JvLVAgz3ED7MPdh3CgUDrN2fiqNGej8cYRKO9maZ+lrC3pcJNeHwTZdCvwpdx1M609xNWccScd8DYzSx9O+LK+yokRnXLFniv87ryc9K2/eF1ecZsCpSWnfm+bo/LZwWSmJ6UauTES1yhKQ5yNRdWnsy3WySdGamrBfqdINb69/Qg==',
        'U2FsdGVkX19pgltZJtyDm1mIUjpB6guWENTcWZxz0JvLVAgz3ED7MPdh3CgUDrN2fiqNGej8cYRKO9maZ+lrC3pcJNeHwTZdCvwpdx1M609xNWccScd8DYzSx9O+LK+yokRnXLFniv87ryc9K2/eF1ecZsCpSWnfm+bo/LZwWSmJ6UauTES1yhKQ5yNRdWnsy3WySdGamrBfqdINb69/Qg==',
        1701087524000,
        1701087524000,
        'U2FsdGVkX19pgltZJtyDm1mIUjpB6guWENTcWZxz0JvLVAgz3ED7MPdh3CgUDrN2fiqNGej8cYRKO9maZ+lrC3pcJNeHwTZdCvwpdx1M609xNWccScd8DYzSx9O+LK+yokRnXLFniv87ryc9K2/eF1ecZsCpSWnfm+bo/LZwWSmJ6UauTES1yhKQ5yNRdWnsy3WySdGamrBfqdINb69/Qg==',
        'U2FsdGVkX19pgltZJtyDm1mIUjpB6guWENTcWZxz0JvLVAgz3ED7MPdh3CgUDrN2fiqNGej8cYRKO9maZ+lrC3pcJNeHwTZdCvwpdx1M609xNWccScd8DYzSx9O+LK+yokRnXLFniv87ryc9K2/eF1ecZsCpSWnfm+bo/LZwWSmJ6UauTES1yhKQ5yNRdWnsy3WySdGamrBfqdINb69/Qg==');