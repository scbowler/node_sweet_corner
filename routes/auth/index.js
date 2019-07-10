const router = require('express').Router();
const { createAccount, signIn } = require('./controllers');

/*
    /auth Routes
*/

// /auth/create-account
router.post('/create-account', createAccount);

// /auth/sign-in
router.post('/sign-in', signIn);

module.exports = router;
