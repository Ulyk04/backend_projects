const express = require('express');
const bodyParser = require('body-parser');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Используем маршруты для книг
app.use('/api', booksRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
