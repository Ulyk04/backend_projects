const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

app.listen(PORT , () => {
    console.log(`Server listening on port http://localhost:${PORT}`);
});

let books = [];

app.get('/' , (req , res) => {
    res.send('Welcome to library API');
})

app.post('/books' , (req , res) => {

    if(!req.body.title || !req.body.author) {
        return res.status(404).json({error : 'Title and author are required'});
    }

    const newbook = {
        id: books.length + 1,
        title: req.body.title , 
        author: req.body.author , 
        available: req.body.available !==undefined ? req.body.available:true,
    };
    books.push(newbook);
    res.status(201).json(newbook);
});

app.get('/books' , (req , res) => {
    const {title , author , available} = req.query;
    let filtredbooks = books;

    if( title !== undefined ){
        const filtredbooks = filtredbooks.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));
    }

    if( author !== undefined ){
        const filtredbooks = filtredbooks.filter(b => b.author.toLowerCase().includes(author.toLowerCase()));
    }

    if( available !== undefined){
        const isthat = available === 'true';
        filtredbooks = filtredbooks.filter(b => b.available === isthat);
    }


    res.status(200).send(filtredbooks);
    
});

app.get('/books/:id' , (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');
    res.status(200).json(book);
})

app.put('/books/:id' , (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    book.title = req.body.title;
    book.author = req.body.author;
    book.available = req.body.available;

    res.status(200).json(book);
});

app.delete('/books/:id' , (req,res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    const deletebook = books.splice(book , 1);
    res.status(200).json(deletebook);
})

