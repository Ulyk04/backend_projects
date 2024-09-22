CREATE TABLE roles(
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL
)

CREATE TABLE myusers(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) UNIQUE NOT NULL,
    role_id INT NOT NULL,

    FOREIGN KEY (role_id) REFERENCES roles(id)
)