use chrono::NaiveDateTime;
use diesel::prelude::*;
use rocket::serde::{Deserialize, Serialize};

#[derive(Queryable, Selectable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::user)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct User {
    pub id: Option<i32>,
    pub username: String,
    pub password: String,
}

#[derive(Queryable, Selectable, Insertable, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::data)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Data {
    pub id: Option<i32>,
    pub fk_user_id: i32,
    pub name: String,
    pub username: String,
    pub password: String,
    pub created_at: Option<i64>,
    pub updated_at: Option<i64>,
    pub url: Option<String>,
    pub notes: Option<String>,
}

#[derive(AsChangeset, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::data)]
pub struct UpdateData {
    pub name: Option<String>,
    pub username: Option<String>,
    pub password: Option<String>,
    pub updated_at: Option<i64>,
    pub url: Option<String>,
    pub notes: Option<String>,
}