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
        'U2FsdGVkX18pyy4itR9t/QZuo5u1APaGMFAqxLhmOUcdhS/xCiXfubJHacCxohXGNi70eVmYekY7YaNGR880DkvKFBOxCEFa3KovLSWnX9dO5FP0o2jeX/BgJEyFdb6iVCHz7iGY3dsBTbsGwCZvXYKFc1G6WKisNB2HVFvSxD3ee87EOrPk2rtN5Hdbg2dzSJ1ZP3eYZ/DHMmTjD+cZRg==',
        'U2FsdGVkX19VLgi1BhNyquxBv+68w0iv1sCR71rZ9Bfy654L2djqJuOLdOXgWwM3wpCXX4QIJGHN3N0ORbImL+6SUTpmrry3CKFf8v7iK3wBB9eMUoBTp+1mHCjh+yMPY8QzCtACbimryt/JDZ+3j1vpFK3NYo6iJIoSQvfhXA6QOiIkExZL7oIKX2FnHEgzFSOliWbGPeELCiL5ChVUZg==',
        'U2FsdGVkX195ps3wVeMqN7XlZbl/U6mtOygZpdmkuNe/7tpc/KslaX7Y1zaGKc3qglUvlBWGmvpR975uXSkdU5PcxHBex8bjdjBxLh/kvkbWYnKIqKnlyrUKB+L+x0hUhWCdImxEXJEAtXfr4i9yqjgy2rBc7Fx7fK+fjq47SxdLprQwQAmqML3lOans4hXHL2nfl6iYiKqWq26A7egfsg==',
        1701087524000,
        1701087524000,
        'U2FsdGVkX1+SLNnkE2vNF1pFRG6o19HImR8egN8ymP4HlQ2Jn6JxOSMk0bV+X5yuW4y1y0YEVeZZMG8bf1979h4B9UhkDlhTXZjfmLwDuzoCbRx/OmDxcWFHVlpLyo1JxszS4is8aOumQGvtX8taIcfHPxqI4LsdZ4Omil3X/skho0l04JEoxZ6ZeCdsv3QcQPInqb5KYpgR1Wh72uY2Hg==',
        'U2FsdGVkX18h3NX3Bvb5t437EI5rjE2bQ459JywavQUSVY/BDMRBHramMh3CEtN9juVUv88xFYEY+NhwioAka5d12eY7NdILwpX9pYDR+0/npd/0VtS0J910oNE8HaQ4H+vEFhdhpAJoF+zzkfs9PpC67ttVEGie0Exp4HnE/N/nk5iLfdJC6HadG5W51EYC1o6ro+aFmtnPiuKB+S+JcQ==');