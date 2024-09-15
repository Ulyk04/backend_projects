const express = require('express');
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');
const {Pool} = require('pg');

app.use(express.json());

const pool = new Pool({
    user: 'postgres', 
    host: 'localhost', 
    database: 'You DB', 
    password: 'Your password', 
    port: 5432, 
});

const secretkey = 'Your secret key';

const query = (text , params) => pool.query(text , params);

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    
    query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password])
        .then(result => {
            const user = result.rows[0];
            if (!user) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ userID: user.id }, secretkey, { expiresIn: '1h' });
            res.status(200).json({ token });
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

function authenticateToken(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided' });
    }

    try {
        const decoded = jwt.verify(token, secretkey);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token' });
    }
}

app.listen(PORT , () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});

let books = [];

app.get('/' , (req , res) => {
    res.send('Welcome to library API');
})


app.post('/books', authenticateToken, (req, res) => {
    const { title, author, available } = req.body;

    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }

    query('INSERT INTO books (title, author, available) VALUES ($1, $2, $3) RETURNING *', 
        [title, author, available !== undefined ? available : true])
        .then(result => res.status(201).json(result.rows[0]))
        .catch(err => res.status(500).json({ error: err.message }));
});


app.get('/books', authenticateToken, (req, res) => {
    const { title, author, available } = req.query;
    let queryString = 'SELECT * FROM books WHERE TRUE';
    const params = [];

    if (title !== undefined) {
        queryString += ' AND LOWER(title) LIKE LOWER($1)';
        params.push(`%${title}%`);
    }

    if (author !== undefined) {
        queryString += ' AND LOWER(author) LIKE LOWER($2)';
        params.push(`%${author}%`);
    }

    if (available !== undefined) {
        queryString += ' AND available = $3';
        params.push(available === 'true');
    }

    query(queryString, params)
        .then(result => res.status(200).json(result.rows))
        .catch(err => res.status(500).json({ error: err.message }));
});

app.get('/books/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);

    query('SELECT * FROM books WHERE id = $1', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).send('Book not found');
            }
            res.status(200).json(result.rows[0]);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.put('/books/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { title, author, available } = req.body;

    query('UPDATE books SET title = $1, author = $2, available = $3 WHERE id = $4 RETURNING *', 
        [title, author, available, id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).send('Book not found');
            }
            res.status(200).json(result.rows[0]);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});

app.delete('/books/:id', authenticateToken, (req, res) => {
    const id = parseInt(req.params.id);

    query('DELETE FROM books WHERE id = $1 RETURNING *', [id])
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).send('Book not found');
            }
            res.status(200).json(result.rows[0]);
        })
        .catch(err => res.status(500).json({ error: err.message }));
});


