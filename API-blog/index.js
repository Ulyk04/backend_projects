const express = require('express');
const bp = require('body-parser');
const jwt = require('jsonwebtoken');
const {Pool} = require('pg');
const bc = require('bcrypt');

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

const pool = new Pool({
    name: 'postgres',
    host: 'localhost',
    database: 'DB',
    password: 'YOUR PASSWORD',
    port: 5432
});

const secret = 'SECRET KEY';

const query = (text , params) => pool.query(text , params);
const PORT = 3000;

app.listen(PORT  , () => {
    console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});

app.post('/signin' , async(req , res) => {
    const {username , password} = req.body;

    try {
        const hashedPassword = await bc.hash(password, 10);  
        await query('INSERT INTO users_3(username , password) VALUES($1 , $2)' , [username , hashedPassword]);
        const token = jwt.sign({username: username}, secret , {expiresIn: '1h'});
        res.status(200).json(token);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

app.post('/login' , async(req , res) => {
    const {username , password} = req.body;

    try {
        const userResult = await query('SELECT * FROM users_3 WHERE username=$1' , [username]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).send('Incorrect username or password');
        }

        const validPassword = await bc.compare(password, user.password);  
        if (!validPassword) {
            return res.status(401).send('Incorrect username or password');
        }

        const token = jwt.sign({username: user.username}, secret , {expiresIn: '1h'});
        res.status(200).json(token);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

function authenticate(req , res , next) {
    try {
        if (!req.headers.authorization) {
            return res.status(400).send('Token not provided');
        }

        const token = jwt.verify(req.headers.authorization.split(' ')[1], secret);
        req.user = token;  
        next();
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Invalid or expired token'});
    }
}

app.post('/create' , authenticate , async(req, res) => {
    const {title , content} = req.body;
    const {username} = req.user;

    try {
        if (!title || !content) {
            return res.status(400).json('Title and content are required');
        }

        await query('INSERT INTO stats(title , content, author_id) VALUES($1 , $2 , (SELECT id FROM users_3 WHERE username=$3))', [title , content , username]);
        res.status(200).send('Your post is successfully created');
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

app.put('/update' , authenticate , async(req , res) => {
    const {title , content, id} = req.body;

    try {
        if (!title || !content || !id) {
            return res.status(400).json('Title, content, and ID are required');
        }

        await query('UPDATE stats SET title=$2, content=$3 WHERE id=$1', [id , title , content]);
        res.status(200).json('Your post is successfully updated');
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

app.delete('/delete' , authenticate , async(req ,res) => {
    const {id} = req.body;

    try {
        if (!id) {
            return res.status(400).send('ID is required');
        }

        await query('DELETE FROM stats WHERE id=$1', [id]);
        res.status(200).json('Your post is successfully deleted');
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

app.get('/read' , async (req , res) => { 
    try {
        const cont = await query('SELECT * FROM stats' , []);
        res.status(200).json(cont.rows);
    }
    catch(err) {
        console.log(err);
        res.status(500).json({err: 'Something is wrong on the server'});
    }
});

app.post('/comment' , authenticate , async(req , res) => {
    const {content , post_id} = req.body;
    const {username} = req.user;

    if(!content || !post_id){
        res.status(404).send('Content or POST ID is required')};
    
    try{
        const user_idd = await query('SELECT id FROM users_3 WHERE username = $1' , [username]);
        const number = user_idd.rows[0].id;
        await query('INSERT INTO comments(content , post_id ,author_id) VALUES($1 , $2 , $3)' , [content , post_id , number]);
        res.status(200).send('Your comment is succefully created');       
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong in server'});
    }
}); 

app.delete('/comments/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { username } = req.user;

    try {
        
        const commentResult = await query('SELECT author_id FROM comments WHERE id=$1', [id]);
        if (commentResult.rows.length === 0) {
            return res.status(404).json('Comment not found');
        }

        const commentAuthorId = commentResult.rows[0].author_id;
        const userResult = await query('SELECT id, role FROM users_3 WHERE username=$1', [username]);
        const user_id = userResult.rows[0].id;
        const user_role = userResult.rows[0].role;

        if (user_id !== commentAuthorId && user_role !== 'admin') {
            return res.status(403).json('You do not have permission to delete this comment');
        }

        await query('DELETE FROM comments WHERE id=$1', [id]);
        res.status(200).json('Comment successfully deleted');
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong on the server' });
    }
});

app.get('/comments/:post_id', async (req, res) => {
    const { post_id } = req.params;

    try {
        const commentsResult = await query('SELECT * FROM comments WHERE post_id=$1', [post_id]);
        res.status(200).json(commentsResult.rows);
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: 'Something went wrong on the server' });
    }
});
