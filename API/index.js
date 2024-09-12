const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT , () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});

let books = [];

app.post('/books' , (req , res) => {
    const newbook = {
        id: books.length + 1,
        title: req.body.title , 
        author: req.body.author , 
        available: req.body.available || true,
    };
    books.push(newbook);
    res.status(201).json(newbook);
});

app.get('/books' , (req , res) => {
    res.json(books);
});

app.get('/books/:id' , (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');
    res.json(book);
})

app.put('/books/:id' , (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    book.title = req.body.title;
    book.author = req.body.author;
    book.available = req.body.available;

    res.json(book);
});

app.delete('/books/:id' , (req,res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    const deletebook = books.splice(book , 1);
    res.json(deletebook);
})