CREATE TABLE users_2(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) UNIQUE NOT NULL
)

CREATE TABLE products(
    id SERIAL PRIMARY KEY ,
    name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock INT NOT NULL
)

CREATE TABLE orders(
    id SERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    status VARCHAR(100) NOT NULL,
    total BIGINT NOT NULL
)

INSERT INTO users_2(username , password)
VALUES('Ulykpan' , '123456')
