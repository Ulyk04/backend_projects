
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author VARCHAR(100) NOT NULL,
    available BOOLEAN DEFAULT true NOT NULL
);

INSERT INTO users(username, password)
VALUES('username1' , 'pass1')
('username2' , 'pass2');

INSERT INTO books(title , author , available)
VALUES('Harry Potter' , 'Liana' , true),
('My world' , 'Karina' , false);

SELECT * FROM books;
SELECT * FROM users;
