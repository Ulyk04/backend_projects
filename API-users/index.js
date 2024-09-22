const express = require('express');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const bp = require('body-parser');
const app = express();

const secret = 'js45key'

app.use(bp.json()); 
app.use(bp.urlencoded({ extended: true })); 


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'projects',
    password: '2020lmn',
    port: 5432,
});

const query = (text, params) => pool.query(text, params);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is starting on port http://localhost:${PORT}`);
});


app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        
        const hashedPassword = await bcrypt.hash(password, 10);

        const defaultRoleId = 2; 

        await query('INSERT INTO myusers (username, email, password, role_id) VALUES ($1, $2, $3, $4)', 
            [username, email, hashedPassword, defaultRoleId]);

        res.status(200).send('User registered successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});



app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        
        const result = await query('SELECT * FROM myusers WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(400).send('Invalid username or password');
        }
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password');
        }
    
        const token = jwt.sign({ userID: user.id, role: user.role_id }, secret, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


function checkRole(requiredRole) {
    return (req, res, next) => {
        try {
            if (!req.headers.authorization) {
                return res.status(401).send('Token not provided');
            }
            
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, secret);

            if (decodedToken.role !== requiredRole) {
                return res.status(403).send('Access denied');
            }

            next();
        } catch (err) {
            return res.status(401).send('Unauthorized');
        }
    };
}


app.put('/user/:id/role', checkRole(1), async (req, res) => {
    const { role_id } = req.body;
    const { id } = req.params;

    try {
        await query('UPDATE myusers SET role_id = $1 WHERE id = $2', [role_id, id]);
        res.status(200).send('User role updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


function isAuthenticated(req, res, next) {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send('Token not provided');
        }
        
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, secret);
        
        next();
    } catch (err) {
        return res.status(401).send('Unauthorized');
    }
}


app.put('/user/profile', isAuthenticated, async (req, res) => {
    const { username, email } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, secret);
    const userId = decodedToken.userID;

    try {
        await query('UPDATE myusers SET username = $1, email = $2 WHERE id = $3', 
            [username, email, userId]);

        res.status(200).send('Profile updated successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});


app.get('/admin', checkRole(1), (req, res) => {
    res.send('Welcome Admin');
});



