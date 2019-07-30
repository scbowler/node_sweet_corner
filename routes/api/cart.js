const router = require('express').Router();
const { getCart, items, totals } = require('./controllers/cart');
const optionalAuth = require(__root + '/middleware/optional_auth');
const withCart  = require(__root + '/middleware/with_cart');

/*
    /api/cart Routes
*/

router.get('/', optionalAuth, withCart, getCart);

router.post('/items/:product_id', optionalAuth, withCart, items.add);

router.get('/totals', optionalAuth, withCart, totals);

module.exports = router;
