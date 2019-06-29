const express = require('express');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());
// app.use('/auth/*', (req, res, next) => {
//     // console.log(req);
//     console.log('Request URL:', req.baseUrl);
//     console.log('Request Query String:', req.query);
//     console.log('Request Body:', req.body);

//     next();
// });

const logger = (req, res, next) => {
    // console.log(req);
    console.log('Request URL:', req.baseUrl);
    console.log('Request Query String:', req.query);
    console.log('Request Body:', req.body);

    next();
}

function withUser(req, res, next){
    // User came from DB query
    const user = {
        id: 78,
        name: 'Hank Hill',
        email: 'kingohill@example.com'
    }

    // const user = null;

    if(user){
        req.user = user;
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

app.get('/', withUser, (request, response) => {

    console.log('HOME CONTROLLER USER:', request.user);

    response.send({
        message: 'This is the home route',
        user: {
            name: 'George Hill',
            email:  'george@email.com'
        }
    });
});

// GET /article

// const resp = {
//     title: 'asd',
//     content: '',
//     author: {
//         name: '',
//         email: ''
//     }
// }

app.get('/extra-data', (req, res) => {

    res.send({
        message: 'Get query data',
        queryData: req.query,
        moreData: 'Here is more data'
    });
});

app.get('/article', (req, res) => {

    res.send({
        title: 'Some Article',
        content: 'This is the content of the article',
        author: {
            name: 'James H',
            email: 'james@example.com'
        }
    });
});

app.post('/auth/sign-in', logger, (req, res) => {
    console.log('POST DATA:', req.body);

    res.send({
        message: 'You have signed in',
        postData: req.body
    });
});

// PATCH /update-user
// PATCH DATA: name, email

// OUTPUT { message: 'User updated', patchData: {}}

app.patch('/auth/update-user', logger, (req, res) => {
    res.send({
        message: 'User updated',
        patchData: req.body
    });
});

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
