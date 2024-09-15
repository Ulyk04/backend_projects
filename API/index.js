const express = require('express');
const app = express();
const PORT = 3000;
const jwt = require('jsonwebtoken');

app.use(express.json());

const secretkey = 'm45secret';

const users = [
    {id: 1, username: 'user1' , password: 'password1'},
    {id:2 , username:'user2' , password:'password2'},
];

app.post('/login' , (req , res) => {
    const {username , password} = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if(!user){
        return res.status(401).json({error:'Invalid username or password'});
    }

    const token = jwt.sign({userID: user.id} , secretkey , {expiresIn: '1h'});
    res.status(200).json({token});
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

app.post('/books' , authenticateToken,(req , res) => {

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

app.get('/books' , authenticateToken , (req , res) => {
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

app.get('/books/:id' ,authenticateToken, (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');
    res.status(200).json(book);
})

app.put('/books/:id' ,authenticateToken, (req , res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    book.title = req.body.title;
    book.author = req.body.author;
    book.available = req.body.available;

    res.status(200).json(book);
});

app.delete('/books/:id' ,authenticateToken, (req,res) => {
    const book = books.find(b => b.id === parseInt(req.params.id));
    if(!book) return res.status(404).send('Book not found');

    const deletebook = books.splice(book , 1);
    res.status(200).json(deletebook);
})

