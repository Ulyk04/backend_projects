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
    database: 'projects',
    password: '2020lmn',
    port: 5432
});

const secret = 'secret4545'

const query = (text , params) => pool.query(text , params);
const PORT = 3000;

app.listen(PORT  , () => {
    console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
});

app.post('/signin' , async(req , res) => {
    const {username , password} = req.body;

    try{
        
    }
})

