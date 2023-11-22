# Base concept

## Introduction

The goal of this project is to create a basic Password Manager.
The user should be able to store passwords in a secure way and access them easily.

## Implementation

### Frontend

The frontend is implemented using the latest version of Angular,
which is currently Angular 17.

The Frontend does the encryption and decryption of the passwords.
The algorithm used is AES-256-CBC. Before encryption, the passwords are prefixed
with a 128 character salt generated using the Mersenne Twister algorithm.

The user can create, read, update and delete passwords.

### Backend

The backend is implemented in Rust using Rocket for the webserver and Diesel for the database.
The Database is SQLite. Due to encryption in the frontend, neither the Database nor the backend
are able to access any sensitive data in plaintext, and no sensitive data is ever sent over the network.

The backend provides a REST API for the frontend to access the database.
For login management, the backend uses JWTs and the login passwords are hashed using the Argon2id algorithm.

## Owasp Top 10 Risks

- Broken Access Control: The backend uses JWTs for authentication and authorization.
  The JWTs are signed using a secret key, which is only known to the backend.
  The JWTs are also short-lived, so even if an attacker manages to steal a JWT,
  it will be useless after a short time.

- Injection: The backend uses the Diesel ORM, which is safe against SQL injection.

- Cross-Site Scripting (XSS): The frontend uses Angular, which is safe against XSS.

- Cryptographic Failures: The AES-256-CBC algorithm is considered secure and by salting
  the same data will always be encrypted to a different ciphertext.
  The Argon2id algorithm is also considered secure.

- Insecure Design: The design of the application is simple.
  The frontend does the encryption and decryption of the passwords.
  The backend only stores the encrypted passwords and has no way of decrypting them.

- Identification and Authentication failures: See Broken Access Control.