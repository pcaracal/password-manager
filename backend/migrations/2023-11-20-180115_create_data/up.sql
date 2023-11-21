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
        'U2FsdGVkX1/VdGV+/KAFP2XagfVOv64MdVwtSy75vGmrq/PB9inZFgdUPDY2Zl7CDrNs60JCHasqcXYwDSOgM17NmMfCOoi2yFtQVhZFrxfd1Jpp/cpiGjqcn2P0CkWG27huvc5tbB3WYCbfe6CuzZmHatluM6ZOx1iRSnu+fKJeD7IZMoWucaal2wGhflioemm3ZTYK/F1scIVjaYMksQ==',
        'U2FsdGVkX19+RlIPlScEN1+7xK89HnXY5olkh0XIhKlzTyb3kYXs7gJGGNfhM9ccKjqnlYrdex/u2qz6kp4ke0MYHgCkTyfgV5k7fQWj/F/0wTAEhSo2M2gEbMSlpal5HZaT3mtWb72YuGP49JUwe55/yIZRsK3smTg2isBqxhZxI62RXIigOoIaC7H23yXn+5c5HO1bpx0YoFWHRJsPZQ==',
        'U2FsdGVkX1+Amrudily1YmVUgu05UKh4TZYUs6MfT7AOP2P8qJRTpua5zNlsd3dmB/XgFeqLNheGJAuB+qrK5sdC+lYh01fxdMAGu/aKE6YpALKgNBEoEgmC7WxmT09QRigMD4G/R7Iy6YvJ7qYTnaBaw3PZuavDttozi/j19mmZFOkmz4DoiDvQAdE5ca+48oxOP7EVDtiV4OHW0aGjuw==',
        1700559734000,
        1700559734000,
        'U2FsdGVkX1/8e7W0w6z5FR5t/kZdgCnKRyFa3FD13Rhthn1Dg7qKyu6Ah4aoaKJwKk8Ibq+W2XxdO9rawijb+/XgEkT4ByZ3RjBrCVS4X8S38x9aJkrnp536Ygb/4pEzR4OMQhHZCEww+/woNhAo8UpeinVI5aV2HWJwxrgS3Mk0sMQpY8RBtaejp8vyfElikrXCULf8C13EIb0PQe/83A==',
        'U2FsdGVkX199+v17a6I2MhOdg++kl6N9kVIsha/7BZdM7O80krqdtnlqk3kr7uYZT3OyfTSwHR0JdWNIIPPyKpk6UyHDsQGNtH/Bt9ONPgMcXKOS5SnxMPzQa5hOUzZneM6I9Z3On1KLqf+bT47VBKikk47cpkAbSWVaCmpEEN4yDUNJWVich9VWQ5WNcnRQRzyR14khmRy/gdpFiDrEUQ=='
       );