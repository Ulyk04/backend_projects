const {Pool} = require('pg');

const pool = new Pool({
    user: 'USER',
    host: 'HOST',
    database:'DATABASE',
    password: 'PASSWORD',
    post: 5432 , 
});

module.exports = pool;
