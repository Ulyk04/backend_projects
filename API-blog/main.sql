CREATE TABLE users_3(
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(100) NOT NULL
)

CREATE TABLE stats(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    content VARCHAR(100) NOT NULL,
    author_id INT NOT NULL,

    FOREIGN KEY (author_id) REFERENCES users_3(id)
)

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    post_id INT REFERENCES stats(id),
    author_id INT REFERENCES users_3(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
