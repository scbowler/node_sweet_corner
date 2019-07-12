const jwt = require('jwt-simple');
const db = require(__root + '/db');
const { cartSecret } = require(__root + '/config').jwt;

module.exports = async (req, res, next) => {
    try {
        // const { product_id } = req.params;
        const { product_id  } = req.params;
        let { quantity = 1 } = req.body;
        let { 'x-cart-token': cartToken } = req.headers;
        let cartData = null;

        quantity = parseInt(quantity);

        if(isNaN(quantity)){
            throw new StatusError(422, 'Invalid quantity given, must be a number');
        }

        if(!product_id){
            throw new StatusError(422, 'No product ID provided');
        }

        if(cartToken){
            // Retrieve cart data
            cartData = jwt.decode(cartToken, cartSecret);

        } else {
            // Create a new cart

            // [[results], [field data]]
            const [[cartStatus = null]] = await db.query('SELECT id FROM cartStatuses WHERE mid="active"');

            if(!cartStatus){
                throw new StatusError(500, 'Unable to find cart status');
            }

            const [result] = await db.query(`INSERT INTO carts 
                (lastInteraction, pid, createdAt, updatedAt, statusId)
                VALUES (CURRENT_TIME, UUID(), CURRENT_TIME, CURRENT_TIME, ${cartStatus.id})
            `);

            cartData = {
                cartId: result.insertId,
                tokenCreatedAt: Date.now()
            };

            cartToken = jwt.encode(cartData, cartSecret);

        }

        const [[product = null]] = await db.execute(
            'SELECT id FROM products WHERE pid=?',
            [product_id]
        );

        if(!product){
            throw new StatusError(422, 'Invalid product ID');
        }



        res.send({
            message: 'Add item to cart',
            cartToken
        });
    } catch(error){
        next(error);
    }
}
