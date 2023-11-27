use chrono::Utc;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation};
use jwt_simple::prelude::*;
use dotenvy::dotenv;
use std::env;

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString,
    },
    Argon2,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub fn encode_token(user_id: Option<i32>) -> String {
    dotenv().ok();
    if user_id == None {
        return String::from("Error");
    }

    let claims = Claims {
        sub: user_id.unwrap().to_string(),
        exp: (Utc::now() + chrono::Duration::hours(1)).timestamp() as usize,
    };

    let header = Header::new(Algorithm::HS256);
    let jwt_secret = env::var("JWT_SECRET").expect("jwt_secret must be set");
    let key = EncodingKey::from_secret(jwt_secret.as_ref());
    let token = jsonwebtoken::encode(&header, &claims, &key).unwrap();

    token
}

pub fn decode_token(token: &str) -> i32 {
    dotenv().ok();
    if token == "" {
        return -1;
    }
    let jwt_secret = env::var("JWT_SECRET").expect("jwt_secret must be set");
    let key = DecodingKey::from_secret(jwt_secret.as_ref());
    let validation = Validation::new(Algorithm::HS256);
    let token_data = jsonwebtoken::decode::<Claims>(token, &key, &validation).unwrap();

    if token_data.claims.sub.parse::<i32>().is_ok() {
        token_data.claims.sub.parse::<i32>().unwrap()
    } else {
        -1
    }
}

pub fn hash_password(password: &str) -> String {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2.hash_password(password.as_bytes(), &salt).unwrap().to_string()
}

pub fn verify_password(password: &str, password_hash: &str) -> bool {
    let argon2 = Argon2::default();
    let password_hash = PasswordHash::new(password_hash).unwrap();
    argon2.verify_password(password.as_bytes(), &password_hash).is_ok()
}
