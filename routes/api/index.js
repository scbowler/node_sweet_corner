const router = require('express').Router();
/*
    /api Routes
*/

router.use('/products', require('./products'));

module.exports = router;
