mod auth;

#[macro_use]
extern crate rocket;

use diesel::prelude::*;
use backend::*;
use backend::models::{Data, Folder, UpdateData, UpdateFolder, UpdateUser, User};
use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{self, Outcome, Request, FromRequest};
use serde_json::json;

#[post("/register", data = "<user>")]
fn register(user: Json<User>) -> (Status, Option<Json<String>>) {
    let mut connection = establish_connection();
    let new_user = User {
        id: None,
        username: user.username.clone(),
        password: auth::hash_password(&user.password),
    };

    match schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection) {
        Ok(_) => return (Status::Conflict, Option::from(Json(String::from("User already exists")))),
        Err(_) => (),
    };


    diesel::insert_into(schema::user::table)
        .values(&new_user)
        .execute(&mut connection)
        .expect("Error saving new user");

    let results = schema::user::table
        .order(schema::user::id.desc())
        .first::<User>(&mut connection)
        .expect("Error loading users");

    (Status::Ok, Option::from(Json(auth::encode_token(results.id))))
}

#[post("/login", data = "<user>")]
fn login(user: Json<User>) -> (Status, Option<Json<String>>) {
    let mut connection = establish_connection();

    match schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection) {
        Ok(_) => (),
        Err(_) => return (Status::NotFound, None),
    };

    let results = schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection)
        .expect("Error loading users");

    if auth::verify_password(&user.password, &results.password) {
        // (Status::Ok, Option::from(auth::encode_token(results.id)))
        (Status::Ok, Option::from(Json(auth::encode_token(results.id))))
    } else {
        (Status::Unauthorized, None)
    }
}

struct Token<'r>(&'r str);

#[rocket::async_trait]
impl<'r> FromRequest<'r> for Token<'r> {
    type Error = ();

    async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        fn is_valid(token: &str) -> bool {
            if token == "" {
                return false;
            }

            auth::decode_token(token) != -1
        }

        match req.headers().get_one("Authorization") {
            None => Outcome::Error((Status::BadRequest, ())),
            Some(key) if is_valid(key) => Outcome::Success(Token(key)),
            Some(_) => Outcome::Error((Status::Unauthorized, ())),
        }
    }
}


#[post("/data", data = "<data>")]
fn create_data(token: Token, data: Json<Data>) -> (Status, Option<Json<Data>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    let new_data = Data {
        id: None,
        fk_user_id: user_id,
        name: data.name.clone(),
        username: data.username.clone(),
        password: data.password.clone(),
        created_at: Option::from(chrono::Utc::now().timestamp() * 1000),
        updated_at: Option::from(chrono::Utc::now().timestamp() * 1000),
        url: data.url.clone(),
        notes: data.notes.clone(),
        fk_folder_id: data.fk_folder_id.clone(),
    };
    println!("{:?}", chrono::Utc::now().timestamp());

    diesel::insert_into(schema::data::table)
        .values(&new_data)
        .execute(&mut connection)
        .expect("Error saving new data");

    let results = schema::data::table
        .order(schema::data::id.desc())
        .first::<Data>(&mut connection)
        .expect("Error loading data");

    (Status::Ok, Option::from(Json(results)))
}

#[get("/data")]
pub fn get_data(token: Token) -> (Status, Option<Json<Vec<Data>>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    let results = schema::data::table
        .filter(schema::data::fk_user_id.eq(user_id))
        .load::<Data>(&mut connection)
        .expect("Error loading data");

    (Status::Ok, Option::from(Json(results)))
}


#[patch("/data/<id>", data = "<data>")]
pub fn update_data(token: Token, id: i32, data: Json<UpdateData>) -> (Status, Option<Json<Data>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    match schema::data::table
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .first::<Data>(&mut connection) {
        Ok(_) => (),
        Err(_) => return (Status::NotFound, None),
    };

    let updated_data = UpdateData {
        name: data.name.clone(),
        username: data.username.clone(),
        password: data.password.clone(),
        updated_at: Option::from(chrono::Utc::now().timestamp() * 1000),
        url: data.url.clone(),
        notes: data.notes.clone(),
        fk_folder_id: data.fk_folder_id.clone(),
    };

    diesel::update(schema::data::table)
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .set(&updated_data)
        .execute(&mut connection)
        .expect("Error updating data");

    let results = schema::data::table
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .first::<Data>(&mut connection)
        .expect("Error loading data");

    (Status::Ok, Option::from(Json(results)))
}

#[patch("/user", data = "<user>")]
fn update_login(token: Token, user: Json<UpdateUser>) -> (Status, Option<Json<String>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    match schema::user::table
        .filter(schema::user::id.eq(user_id))
        .first::<User>(&mut connection) {
        Ok(_) => (),
        Err(_) => return (Status::NotFound, None),
    };

    let pw: String = match user.password.clone() {
        Some(pw) => auth::hash_password(&pw),
        None => schema::user::table
            .filter(schema::user::id.eq(user_id))
            .select(schema::user::password)
            .first::<String>(&mut connection)
            .expect("Error loading users"),
    };

    let updated_user = UpdateUser {
        username: None,
        password: Some(pw),
    };

    diesel::update(schema::user::table)
        .filter(schema::user::id.eq(user_id))
        .set(&updated_user)
        .execute(&mut connection)
        .expect("Error updating user");

    let results = schema::user::table
        .filter(schema::user::id.eq(user_id))
        .first::<User>(&mut connection)
        .expect("Error loading users");

    (Status::Ok, Option::from(Json(auth::encode_token(results.id))))
}

#[get("/login")]
fn check_login(token: Token) -> Status {
    let user_id = auth::decode_token(token.0);

    if user_id == -1 {
        return Status::Unauthorized;
    }

    Status::Ok
}

#[delete("/data/<id>")]
pub fn delete_data(token: Token, id: i32) -> Status {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    match schema::data::table
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .first::<Data>(&mut connection) {
        Ok(_) => (),
        Err(_) => return Status::NotFound,
    };

    diesel::delete(schema::data::table)
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .execute(&mut connection)
        .expect("Error deleting data");

    Status::Ok
}

#[post("/folder", data = "<folder>")]
fn create_folder(token: Token, folder: Json<Folder>) -> (Status, Option<Json<Folder>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    let new_folder = Folder {
        id: None,
        fk_user_id: user_id,
        name: folder.name.clone(),
    };

    diesel::insert_into(schema::folder::table)
        .values(&new_folder)
        .execute(&mut connection)
        .expect("Error saving new folder");

    let results = schema::folder::table
        .order(schema::folder::id.desc())
        .first::<Folder>(&mut connection)
        .expect("Error loading folder");

    (Status::Ok, Option::from(Json(results)))
}

#[get("/folder")]
pub fn get_folder(token: Token) -> (Status, Option<Json<Vec<Folder>>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    let results = schema::folder::table
        .filter(schema::folder::fk_user_id.eq(user_id))
        .load::<Folder>(&mut connection)
        .expect("Error loading folder");

    (Status::Ok, Option::from(Json(results)))
}

#[patch("/folder/<id>", data = "<folder>")]
pub fn update_folder(token: Token, id: i32, folder: Json<Folder>) -> (Status, Option<Json<Folder>>) {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    match schema::folder::table
        .filter(schema::folder::id.eq(id))
        .filter(schema::folder::fk_user_id.eq(user_id))
        .first::<Folder>(&mut connection) {
        Ok(_) => (),
        Err(_) => return (Status::NotFound, None),
    };

    let updated_folder = UpdateFolder {
        name: Some(folder.name.clone()),
    };

    diesel::update(schema::folder::table)
        .filter(schema::folder::id.eq(id))
        .filter(schema::folder::fk_user_id.eq(user_id))
        .set(&updated_folder)
        .execute(&mut connection)
        .expect("Error updating folder");

    let results = schema::folder::table
        .filter(schema::folder::id.eq(id))
        .filter(schema::folder::fk_user_id.eq(user_id))
        .first::<Folder>(&mut connection)
        .expect("Error loading folder");

    (Status::Ok, Option::from(Json(results)))
}

#[delete("/folder/<id>")]
pub fn delete_folder(token: Token, id: i32) -> Status {
    let mut connection = establish_connection();
    let user_id = auth::decode_token(token.0);

    match schema::folder::table
        .filter(schema::folder::id.eq(id))
        .filter(schema::folder::fk_user_id.eq(user_id))
        .first::<Folder>(&mut connection) {
        Ok(_) => (),
        Err(_) => return Status::NotFound,
    };

    let data = schema::data::table
        .filter(schema::data::fk_folder_id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .load::<Data>(&mut connection)
        .expect("Error loading data");

    for d in data {
        let updated_data = UpdateData {
            name: Some(d.name.clone()),
            username: Some(d.username.clone()),
            password: Some(d.password.clone()),
            updated_at: Option::from(chrono::Utc::now().timestamp() * 1000),
            url: d.url.clone(),
            notes: d.notes.clone(),
            fk_folder_id: Some(-1),
        };

        diesel::update(schema::data::table)
            .filter(schema::data::id.eq(d.id))
            .filter(schema::data::fk_user_id.eq(user_id))
            .set(&updated_data)
            .execute(&mut connection)
            .expect("Error updating data");
    }

    diesel::delete(schema::folder::table)
        .filter(schema::folder::id.eq(id))
        .filter(schema::folder::fk_user_id.eq(user_id))
        .execute(&mut connection)
        .expect("Error deleting folder");

    Status::Ok
}

#[launch]
fn rocket() -> _ {
    let cors = rocket_cors::CorsOptions::default()
        .allowed_origins(rocket_cors::AllowedOrigins::all())
        .allow_credentials(true)
        .to_cors().unwrap();

    rocket::build()
        .attach(cors)
        .mount("/", routes![register])
        .mount("/", routes![login])
        .mount("/", routes![create_data])
        .mount("/", routes![get_data])
        .mount("/", routes![update_data])
        .mount("/", routes![update_login])
        .mount("/", routes![check_login])
        .mount("/", routes![delete_data])
        .mount("/", routes![create_folder])
        .mount("/", routes![get_folder])
        .mount("/", routes![update_folder])
        .mount("/", routes![delete_folder])
}