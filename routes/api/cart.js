const router = require('express').Router();
const { items } = require('./controllers/cart');

/*
    /api/cart Routes
*/

router.post('/items/:product_id', items.add);

module.exports = router;
