const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',  // замени на свое имя пользователя
    host: 'localhost',
    database: 'projects',
    password: '2020lmn',  // замени на свой пароль
    port: 5432,
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/articles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM articles ORDER BY created_at DESC');
        res.render('articles/index', { articles: result.rows });
    } catch (err) {
        console.error(err);
        res.send('Error retrieving articles');
    }
});

app.get('/articles/new', (req, res) => {
    res.render('articles/new');
});

app.post('/articles', async (req, res) => {
    const { title, body } = req.body;
    try {
        await pool.query('INSERT INTO articles (title, body) VALUES ($1, $2)', [title, body]);
        res.redirect('/articles');
    } catch (err) {
        console.error(err);
        res.send('Error creating article');
    }
});

app.get('/articles/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
        res.render('articles/edit', { article: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.send('Error retrieving article for edit');
    }
});

app.put('/articles/:id', async (req, res) => {
    const { id } = req.params;
    const { title, body } = req.body;
    try {
        await pool.query('UPDATE articles SET title = $1, body = $2 WHERE id = $3', [title, body, id]);
        res.redirect('/articles');
    } catch (err) {
        console.error(err);
        res.send('Error updating article');
    }
});

app.delete('/articles/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM articles WHERE id = $1', [id]);
        res.redirect('/articles');
    } catch (err) {
        console.error(err);
        res.send('Error deleting article');
    }
});
