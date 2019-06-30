const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { dbConfig } = require('./config');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const db = mysql.createPool(dbConfig);

/* User Model
{
    name: '', 
    email: '',
    id: '',
    password: '',
    created_at: '',
    updated_at: ''
}
*/

app.post('/auth/sign-up', async (req, res) => {
    const { email, name, password } = req.body;

    const errors = [];

    if(!email){
        errors.push('No email provided');
    }

    if(!name){
        errors.push('No name provided');
    }

    if(!password){
        errors.push('No password provided');
    } else if(password.length < 6){
        errors.push('Password is too short');
    }

    if(errors.length){
        return res.status(422).send({
            errors: errors
        });
    }

    const [[existingUser = null]] = await db.execute(
        'SELECT id FROM users WHERE email=?',
        [email]
    );

    if(existingUser){
        return res.status(422).send({ error: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await db.execute(
        'INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIME, CURRENT_TIME)',
        [name, email, hashedPassword]
    );

    res.send({
        message: 'Account successfully created',
        user: {
            name,
            userId: result.insertId
        }
    });
});

app.post('/sign-in', async (req, res) => {
    // check we received an email and password

    // no email and or password 422

    // Query DB for user with matching email
    // No email found in DB 401

    // use bcrypt to compare passwords
    // Passwords don't match 401

    // if everything matches send back
    // {
    //     message: 'Sign in success',
    //         user: {
    //         name: 'Sarah Conner',
    //         userId: 9
    //     }
    // }
});

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
