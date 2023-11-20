#[macro_use]
extern crate rocket;

use diesel::prelude::*;
use backend::*;
use backend::models::User;
use rocket::serde::*;

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

#[post("/register")]
fn register() -> rocket::serde::json::Json<User> {
    let mut connection = establish_connection();
    let new_user = User {
        id: None,
        username: String::from("test"),
        password: String::from("test"),
    };

    diesel::insert_into(schema::user::table)
        .values(&new_user)
        .execute(&mut connection)
        .expect("Error saving new user");

    let results = schema::user::table
        .order(schema::user::id.desc())
        .first::<User>(&mut connection)
        .expect("Error loading users");

    rocket::serde::json::Json(results)
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index]).mount("/", routes![register])
}