# Password Manager

A basic Password Manager with a Rust backend, SQLite database and Angular frontend.

## Installation

### Requirements

This application is still in development and not yet ready for production use.
It has only been tested on Linux, but should also work on Windows and MacOS.

- Rust
- SQLite
- Diesel CLI
- Cargo
- bun | npm | pnpm
- Angular CLI

### Setup (Linux)

#### Backend

1. Clone the repository
2. cd into the repository, then into the backend directory
3. Run `echo "DATABASE_URL=db.sqlite3" >> .env`
4. Run `touch db.sqlite3`
5. Run `cargo install diesel_cli --no-default-features --features sqlite`
6. Run `diesel setup`
7. Run `diesel migration run`

#### Frontend

1. cd into the repository, then into the frontend directory
2. Run `npm i` or the equivalent for your choice of package manager
3. Run `ng serve --open` (You can omit the --open to not open a new window in your default browser)
4. The frontend should now be running on http://localhost:4200