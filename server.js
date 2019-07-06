const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { dbConfig } = require('./config');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());

const db = mysql.createPool(dbConfig);

function imageUrl(req, type, file){
    return `${req.protocol}://${req.get('host')}/images/${type}/${file}`;
}

app.get('/api/products', async (req, res) => {
    const [result] = await db.query('SELECT p.pid AS id, p.caption, p.cost, p.name, i.pid AS thumb_id, i.altText, i.file, i.type FROM products AS p JOIN images AS i ON p.thumbnailId=i.id');

    const products = result.map((product) => {
        return {
            id: product.id,
            caption: product.caption,
            cost: product.cost,
            name: product.name,
            thumbnail: {
                id: product.thumb_id,
                altText: product.altText,
                file: product.file,
                type: product.type,
                url: imageUrl(req, product.type, product.file)
            }
        }
    });

    res.send({products});
});

app.get('/api/products/:product_id', async (req, res) => {
    const { product_id } = req.params;

    if(!product_id){
        return res.status(422).send('Missing product ID');
    }

    const [[product = null]] = await db.execute(
        'SELECT p.pid AS productId, p.caption, p.cost, p.description, p.name, im.pid AS imageId, im.altText AS imageAltText, im.file AS imageFile, im.type AS imageType, tn.pid AS tnId, tn.altText AS tnAltText, tn.file AS tnFile, tn.type AS tnType FROM products AS p JOIN images AS im ON p.imageId=im.id JOIN images AS tn ON p.thumbnailId=tn.id WHERE p.pid=?',
        [product_id]
    );

    if(!product){
        return res.status(422).send('Invalid product ID');
    }

    res.send({
        id: product.productId,
        caption: product.caption,
        cost: product.cost,
        description: product.description,
        name: product.name,
        image: {
            id: product.imageId,
            altText: product.imageAltText,
            file: product.imageFile,
            type: product.imageType,
            url: imageUrl(req, product.imageType, product.imageFile)
        },
        thumbnail: {
            id: product.tnId,
            altText: product.tnAltText,
            file: product.tnFile,
            type: product.tnType,
            url: imageUrl(req, product.tnType, product.tnFile)
        }
    });
});

app.post('/auth/create-account', async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    const errors = [];

    if(!email){
        errors.push('No email provided');
    }

    if(!firstName){
        errors.push('No first name provided');
    }

    if(!lastName){
        errors.push('No last name provided');
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

    const [[role = null]] = await db.query('SELECT id FROM userRoles WHERE mid="customer"');

    if(!role){
        return res.status(500).send({error: 'Internal server error'});
    }

    const [result] = await db.execute(
        `INSERT INTO users 
            (firstName, lastName, email, password, pid, roleId, lastAccessedAt, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, UUID(), ?, CURRENT_TIME, CURRENT_TIME, CURRENT_TIME)`,
        [firstName, lastName, email, hashedPassword, role.id]
    );

    const [[user]] = await db.query(`SELECT CONCAT(firstName, ' ', lastName) AS name, email, pid FROM users WHERE id=${result.insertId}`);

    res.send({
        message: 'Account successfully created',
        user
    });
});

app.post('/auth/sign-in', async (req, res) => {
    const { email, password } = req.body;

    const errors = [];

    if(!email){
        errors.push('No email received');
    }

    if (!password) {
        errors.push('No password received');
    }

    if(errors.length){
        return res.status(422).send({errors});
    }

    const [[foundUser = null]] = await db.execute(
        'SELECT CONCAT(firstName, " ", lastName) AS name, email, pid, password as hash FROM users WHERE email=?',
        [email]
    );

    if(!foundUser){
        return res.status(401).send('Unauthorized');
    }

    const { hash, ...user } = foundUser; 

    const passwordsMatch = await bcrypt.compare(password, hash);

    if(!passwordsMatch){
        return res.status(401).send('Unauthorized');
    }

    res.send({
        message: 'Sign in success',
        user
    });
});

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
