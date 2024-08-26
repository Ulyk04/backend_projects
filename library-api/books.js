const express = require('express');
const router = express.Router();
const pool = require('../config');

// Получить все книги
router.get('/books', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM books');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Произошла ошибка при получении данных' });
    }
});

// Добавить новую книгу
router.post('/books', async (req, res) => {
    const { title, author, published_date } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO books (title, author, published_date) VALUES ($1, $2, $3) RETURNING *',
            [title, author, published_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Произошла ошибка при добавлении книги' });
    }
});

module.exports = router;
