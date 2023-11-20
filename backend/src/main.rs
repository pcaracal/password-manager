mod auth;

#[macro_use]
extern crate rocket;

use std::convert::Infallible;
use diesel::prelude::*;
use backend::*;
use backend::models::{Data, UpdateData, User};
use rocket::serde::json::Json;
use rocket::http::Status;
use rocket::request::{self, Outcome, Request, FromRequest};

#[get("/")] // Returns a list of all users
fn index() -> String {
    use backend::schema::user::dsl::*;
    let mut connection = establish_connection();
    let results = user.load::<User>(&mut connection).expect("Error loading users");

    let mut response = String::from("Hello, world!\n");
    for usr in results {
        response.push_str(&format!("{:?} {:?}: {:?}\n", usr.id, usr.username, usr.password));
    }
    response
}

#[post("/register", data = "<user>")]
fn register(user: Json<User>) -> String {
    let mut connection = establish_connection();
    let new_user = User {
        id: None,
        username: user.username.clone(),
        password: auth::hash_password(&user.password),
    };

    match schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection) {
        Ok(_) => return String::from("409"),
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

    auth::encode_token(results.id)
}

#[post("/login", data = "<user>")] // Checks if the user exists and if the password is correct and creates a JWT
fn login(user: Json<User>) -> String {
    let mut connection = establish_connection();

    match schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection) {
        Ok(_) => (),
        Err(_) => return String::from("404"),
    };

    let results = schema::user::table
        .filter(schema::user::username.eq(&user.username))
        .first::<User>(&mut connection)
        .expect("Error loading users");

    if auth::verify_password(&user.password, &results.password) {
        auth::encode_token(results.id)
    } else {
        String::from("401")
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
fn create_data(token: Token, data: Json<Data>) -> Status {
    let mut connection = establish_connection();

    let user_id = auth::decode_token(token.0);
    println!("{:?}", user_id);
    println!("{:?}", token.0);

    let new_data = Data {
        id: None,
        fk_user_id: user_id,
        name: data.name.clone(),
        username: data.username.clone(),
        password: data.password.clone(),
        created_at: Option::from(chrono::Utc::now().timestamp() as i32),
        updated_at: Option::from(chrono::Utc::now().timestamp() as i32),
        url: data.url.clone(),
        notes: data.notes.clone(),
    };

    diesel::insert_into(schema::data::table)
        .values(&new_data)
        .execute(&mut connection)
        .expect("Error saving new data");

    let results = schema::data::table
        .order(schema::data::id.desc())
        .first::<Data>(&mut connection)
        .expect("Error loading data");

    Status::Created
}

#[get("/data")]
pub fn get_data(token: Token) -> Json<Vec<Data>> {
    let mut connection = establish_connection();

    let user_id = auth::decode_token(token.0);

    let results = schema::data::table
        .filter(schema::data::fk_user_id.eq(user_id))
        .load::<Data>(&mut connection)
        .expect("Error loading data");

    Json(results)
}


#[patch("/data/<id>", data = "<data>")]
pub fn update_data(token: Token, id: i32, data: Json<UpdateData>) -> Status {
    let mut connection = establish_connection();

    let user_id = auth::decode_token(token.0);

    let results = schema::data::table
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .first::<Data>(&mut connection)
        .expect("Error loading data");

    let updated_data = UpdateData {
        name: data.name.clone(),
        username: data.username.clone(),
        password: data.password.clone(),
        updated_at: Option::from(chrono::Utc::now().timestamp() as i32),
        url: data.url.clone(),
        notes: data.notes.clone(),
    };

    diesel::update(schema::data::table)
        .filter(schema::data::id.eq(id))
        .filter(schema::data::fk_user_id.eq(user_id))
        .set(&updated_data)
        .execute(&mut connection)
        .expect("Error updating data");

    Status::Ok
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index]).mount("/", routes![register]).mount("/", routes![login]).mount("/", routes![create_data]).mount("/", routes![get_data]).mount("/", routes![update_data])
}