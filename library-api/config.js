const {Pool} = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database:'postgres',
    password: '2020lmn',
    post: 5432 , 
});

module.exports = pool;