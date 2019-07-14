const router = require('express').Router();
const withCart  = require(__root + '/middleware/with_cart.js');
const { getCart, items } = require('./controllers/cart');

/*
    /api/cart Routes
*/

router.get('/', withCart, getCart);

router.post('/items/:product_id', items.add);

module.exports = router;
