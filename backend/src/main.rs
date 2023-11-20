mod auth;

#[macro_use]
extern crate rocket;

use diesel::prelude::*;
use rocket::form::{FromForm};
use rocket::http::Status;
use rocket::request::{self, FromRequest, Outcome, Request};
use backend::*;
use backend::models::{Data, User};
use rocket::serde::json::Json;

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

#[post("/data", data = "<data>")]
fn create_data(request: Request, data: Json<Data>) -> Status {
    let user_id = match auth::decode_token(request.headers().get_one("Authorization").unwrap().split_whitespace().collect::<Vec<&str>>()[1]) {
        -1 => return Status::Unauthorized,
        _ => auth::decode_token(request.headers().get_one("Authorization").unwrap().split_whitespace().collect::<Vec<&str>>()[1]),
    };

    let mut connection = establish_connection();

    let new_data = Data {
        id: None,
        fk_user_id: user_id,
        name: data.name.clone(),
        username: data.username.clone(),
        password: data.password.clone(),
        created_at: chrono::Utc::now().timestamp() as i32,
        updated_at: chrono::Utc::now().timestamp() as i32,
        url: None,
        notes: None,
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

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index]).mount("/", routes![register]).mount("/", routes![login]).mount("/", routes![create_data])
}