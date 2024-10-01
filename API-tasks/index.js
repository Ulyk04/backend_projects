const express = require('express');
const {Pool} = require('Pool');
const jwt = require('jsonwebtoken');
const bp = require('body-parser');
const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    email: Joi.string().email().required()
});

const taskSchema = Joi.object({
    title: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    user_id: Joi.number().integer().required()
});

const app = express();
app.use(bp.json());
app.use(bp.urlencoded({extended:true}));

const pool = new Pool({
    user: 'postgres' ,
    host : 'localhost' , 
    database: 'DB' , 
    password : 'YOUR PASSWORD' , 
    port: 5432
});

const secret = 'SECRET KEY';

app.post('/signin' , async(req ,res) => {
    const {username , password} = req.body;
    const { error } = signupSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try{
        await query('INSERT INTO users_1(username, password) VALUES($1 , $2)' , [username , password]);
        const token = jwt.sign({username : username} , secret , {expiresIn : '1h'});
        res.status(200).json(token);
    }
    catch(err){
        console.log(err);
        res.status(500).json(token);
    }
});

app.post('/login' , async (req , res) => {
    const {username , password} = req.body;

    try{
        const username = await query('SELECT $1 FROM users_1)', [username]);
        const password = await query('SELECT $1 FROM users_1' , [password]);
        if(!username || !password){
            res.status(401).send('Incorrect username or password');
        }
        const token = jwt.sign({username: username} , secret , {expiresIn: '1h'});
        res.status(200).json(token);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: message})
    }
});

const query = (text , params) => pool.query(text , params);

const PORT = 3000;

app.listen(PORT  , () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})

app.post('/tasks' ,isAut, async (req , res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const {title , description , user_id} = req.body;

    try{
        await query('INSERT INTO tasks(title , description , user_id)  VALUES($1 , $2 , $3)' , [title , description , user_id]);
        res.status(200).send('Your tasks has been succefully recorded ');
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: message});
    }
    
});

app.get('/gettasks' , isAut,async(req , res) => {
    try{
        const result = await query('SELECT * FROM tasks');
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send({err :  message});
    }
});

app.get('/gettask/:id' , isAut,async(req , res) => {
    const {id} = req.body;

    try{
        const result = await query('SELECT * FROM tasks WHERE id=$1' , [id]);
        res.status(200).json(result);
    }
    catch(err){
        console.log(err);
        res.status(500).send({err: message});
    }
});

app.put('/tasks/:id' , isAut,async(req , res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const {id , title , description , user_id} = req.body;

    try{
        await query('UPDATE tasks SET title=$2 , description=$2 , user_id=$3 WHERE id=$1',[id , title , description , user_id]);
        res.status(200).send('Your code is succefully updated');
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: message});
    }
});

app.delete('/delete' , isAut,async(req, res) => {
    const { error } = taskSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const{title} = req.body;
    try{
        await query('DELETE FROM tasks WHERE title = $1' , [title]);
        res.status(200).send('Your task is succefully deleted');
    }
    catch(err){
        console.log(err);
        res.status(500).json({err : message});
    }
});

function isAut(req , res ,next){
    try{
        if(!req.headers.authorization){
            res.status(401).send('Token not provided')
        }

        const token = jwt.verify(req.headers.authorization.split(' ')[1] ,secret);
        
        next();
    }
    catch(err){
        console.log(err);
        res.status(500).json({err : message});
    }
};

app.get('/information' , (req , res) => {
    res.status(200).send('This API was developed from Ulykpan Kaisar.   WELCOME:)');
});

