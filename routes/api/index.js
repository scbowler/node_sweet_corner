const router = require('express').Router();
/*
    /api Routes
*/

router.use('/products', require('./products'));

router.use('/cart', require('./cart'));

module.exports = router;
