const express = require('express');
const { StatusError } = require('./helpers/error_handling');
const cors = require('cors');
const { resolve } = require('path');
const PORT = process.env.PORT || 9000;

global.__root = __dirname;
global.StatusError = StatusError;

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(express.static(resolve(__dirname, 'client', 'dist')));

require('./routes')(app);

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
