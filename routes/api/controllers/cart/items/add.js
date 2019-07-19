const jwt = require('jwt-simple');
const db = require(__root + '/db');
const { cartSecret } = require(__root + '/config').jwt;

module.exports = async (req, res, next) => {
    try {
        const { product_id  } = req.params;
        let { cart } = req;
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

        if(!cart){
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

            const [[newCart = null]] = await db.query(
                `SELECT * FROM carts WHERE id=${cartData.cartId} AND deletedAt IS NULL`
            );

            if (!newCart) {
                throw new StatusError(500, 'Problem retrieving new cart data');
            }

            cart = newCart;
            cart.items = null;
        } else {
            cartData = {
                cartId: cart.cartId
            }
        }

        const [[product = null]] = await db.execute(
            'SELECT id, name FROM products WHERE pid=? AND deletedAt IS NULL',
            [product_id]
        );

        if(!product){
            throw new StatusError(422, 'Invalid product ID');
        }

        let existingItem = null;

        if(cart.items){
            existingItem = cart.items.find(item => item.id === product.id) || null;
        }

        if(existingItem){
            let newQuantity = quantity + existingItem.quantity;

            if(newQuantity <= 0){
                newQuantity = 0;
            }

            await db.query(
                `UPDATE cartItems 
                    SET quantity=${newQuantity},
                    updatedAt=CURRENT_TIME 
                    ${newQuantity ? '' : ', deletedAt=CURRENT_TIME '}
                    WHERE cartId=${cartData.cartId} AND productId=${product.id}`
            );
        } else {
            if(quantity < 1){
                throw new StatusError(422, 'Quantity must be greater than 0 for new items');
            }

            await db.execute(
                `INSERT INTO cartItems
                (pid, quantity, createdAt, updatedAt, cartId, productId)
                VALUES (UUID(), ?, CURRENT_TIME, CURRENT_TIME, ?, ?)`,
                [quantity, cartData.cartId, product.id]
            );
        }

        const [[total]] = await db.query(
            `SELECT SUM(ci.quantity) AS items, SUM(p.cost * ci.quantity) AS total 
                FROM cartItems AS ci 
                JOIN products AS p ON ci.productId=p.id  
                WHERE cartId=${cartData.cartId} AND ci.deletedAt IS NULL`
        );

        const message = `${quantity} ${product.name} cupcake${quantity > 1 ? 's' : ''} added to cart`;

        res.send({
            cartId: cart.pid,
            cartToken,
            message,
            total
        });
    } catch(error){
        next(error);
    }
}
