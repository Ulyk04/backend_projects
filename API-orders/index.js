const express = require('express');
const bp = require('body-parser');
const {Pool} = require('pg');

const app = express();
const PORT = 3000;
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));



const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'projects',
    password: '2020lmn',
    port: 5432
});
const query = (text , params) => pool.query(text , params);

app.listen(PORT , () => {
    console.log(`Your server is running on http://localhost:${PORT}`);
});

app.post('/products' , async (req , res) => {
    const {name , price , stock} = req.body;

    try{
        if(!req.body.name || !req.body.price || !req.body.stock){
            return res.status(401).send('Name, price and stock can not be empty');
        }
        await query(`INSERT INTO products(name , price , stock) VALUES($1 , $2 , $3)` , [name , price , stock]);
        res.status(200).send('Your product is succcefully writen');
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'});
    }
});

app.post('/orders' , async(req , res) => {
    const {date , status , total} = req.body;

    try{
        if(!req.body.date || !req.body.status || !req.body.total){
            return res.status(401).send('Date,status and total can not be empty');
        };
        await query(`INSERT INTO orders(date , status , total) VALUES($1 , $2 , $3)` , [date , status , total]);
        res.status(200).send('Your order is succefully writen');
    }
    catch(err){
        console.log(err);
        res.status(500).json({err : 'Something is wrong on server'});
    }
});

app.get('/getproducts' , async(req, res) => {
    try{
        const res = await query('SELECT * FROM products');
        res.status(200).json(res);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'})
    };
});

app.get('/getorders' , async(req , res) => {
    try{
        const result = await query('SELECT * FROM orders');
        res.status(200).send(result);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err : 'Something is wrong on server'});
    }
})

app.get('/getproducts:id' , async(req , res) => {
    const {id} = req.params;

    try{
        if(!req.body.id){
            return res.status(401).send('Id in requests can not be empty');
        }
        const ress = await query(`SELECT * FROM products WHERE id = $1` , [id]);
        res.status(200).json(ress);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'});
    }
});

app.get('/getorders:id' , async(req , res) => {
    const {id} = req.params;

    try{
        if(!req.body.id){
            return res.status(401).send('Id in requests can not be empty');
        }
        const resultt = await query(`SELECT * FROM orders WHERE id = $1` , [id]);
        res.status(200).json(resultt);
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'});
    }
});

app.delete('/delete/products' , async(req, res) => {
    const{name} = req.body;

    try{
        if(!req.body.name){
            return res.status(401).send('The name in requests can not be empty');
        }
        await query(`DELETE FROM products WHERE name=$1` , [name]);
        res.status(200).send('This table is succefully deleted')
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'}); 
    }
});

app.delete('/delete/orders' , async(req , res) => {
    const {id} = req.body;

    try{
        if(!req.body.id){
            return res.status(500).send('The id in request is can not be a empty');
        }
        await query(`DELETE FROM orders WHERE id=$1` , [id]);
        res.status(200).send('This table is succefully deleted');
    }
    catch(err){
        console.log(err);
        res.status(500).json({err: 'Something is wrong on server'})
    }
});

app.put('/putproducts/:id' , async(req , res) =>{
    const{id} = req.params
    const{name , price , stock} = req.body;

    try{
        await query(`UPDATE products SET name=$2 , price=$3 , stock=$4 WHERE id=$1` , [id , name , price , stock]);
        res.status(200).send('Your product is succefully updated');
    }
    catch(err){
        console.log(err)
        res.status(500).json({err: 'Something is wrong on server'});
    }
})

app.put('/putorders/:id' , async(req , res) =>{
    const{id} = req.params;
    const{date , status , total} = req.body;

    try{
        await query(`UPDATE orders SET date=$2 , status=$3 , total=$4 WHERE id=$1` , [id , date , status , total]);
        res.status(200).send('Your order is succefully updated');
    }
    catch(err){
        console.log(err)
        res.status(500).json({err: 'Something is wrong on server'});
    }
})
