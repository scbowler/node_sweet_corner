const express = require('express');
const { StatusError } = require('./helpers/error_handling');
const cors = require('cors');
const PORT = process.env.PORT || 9000;

global.__root = __dirname;
global.StatusError = StatusError;

const app = express();

app.use(cors());
app.use(express.urlencoded({extended: false}));
app.use(express.json());

require('./routes')(app);

app.listen(PORT, () => {
    console.log('Server running at localhost:' + PORT);
});
