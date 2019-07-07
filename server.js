const express = require('express');
const bcrypt = require('bcrypt');
const PORT = process.env.PORT || 9000;

const app = express();

app.use(express.urlencoded({extended: false}));
app.use(express.json());



require('./routes')(app);

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
