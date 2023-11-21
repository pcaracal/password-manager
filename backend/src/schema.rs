// @generated automatically by Diesel CLI.

diesel::table! {
    data (id) {
        id -> Nullable<Integer>,
        fk_user_id -> Integer,
        name -> Text,
        username -> Text,
        password -> Text,
        created_at -> Nullable<BigInt>,
        updated_at -> Nullable<BigInt>,
        url -> Nullable<Text>,
        notes -> Nullable<Text>,
    }
}

diesel::table! {
    user (id) {
        id -> Nullable<Integer>,
        username -> Text,
        password -> Text,
    }
}

diesel::joinable!(data -> user (fk_user_id));

diesel::allow_tables_to_appear_in_same_query!(
    data,
    user,
);
