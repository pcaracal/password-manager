mod auth;

#[macro_use]
extern crate rocket;

use diesel::prelude::*;
use backend::*;
use backend::models::{Data, UpdateData, User};
use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{self, Outcome, Request, FromRequest};

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
        Ok(_) => return (Status::Conflict, None),
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
}
