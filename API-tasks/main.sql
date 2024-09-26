CREATE TABLE users_1 (
    id SERIAL PRIMARY KEY , 
    username VARCHAR(100) NOT NULL , 
    email VARCHAR(100) UNIQUE NOT NULL , 
    password VARCHAR(100) NOT NULL
)

CREATE TABLE tasks(
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(100) NOT NULL,
    priority VARCHAR(100) , 
    deadline VARCHAR(100) , 
    status VARCHAR(100) ,
    user_id INT NOT NULL,

    FOREIGN KEY (user_id) REFERENCES users_1(id) 
)