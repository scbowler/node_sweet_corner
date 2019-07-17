const jwt = require('jwt-simple');
const { cartSecret } = require('../config').jwt;
const db = require('../db');

module.exports = async (req, res, next) => {
    try {
        const { 'x-cart-token': cartToken } = req.headers;
        req.cart = null;

        if(cartToken){
            const cartData = jwt.decode(cartToken, cartSecret);

            const [cart = null] = await db.query(
                `SELECT c.id AS cartId, c.lastInteraction, c.pid, c.createdAt,
                    c.updatedAt, c.userId, c.statusId AS cartStatusId,
                    ci.quantity, p.cost FROM carts AS c 
                    JOIN cartItems AS ci ON ci.cartId=c.id
                    JOIN products AS p ON ci.productId=p.id
                    WHERE c.id=${cartData.cartId} AND c.deletedAt IS NULL AND ci.deletedAt IS NULL`
            );

            if(!cart){
                throw new StatusError(422, 'Invalid cart token');
            }

            const {cost, quantity, ...cartItem} = cart[0];

            // const formattedCart = {
            //     ...cartItem,
            //     items: cart.map(({ cost, quantity }) => ({ cost, quantity }))
            // };

            const formattedCart = {
                ...cartItem,
                items: cart.map((item) => {
                    return {
                        cost: item.cost,
                        quantity: item.quantity
                    }
                })
            };

            req.cart = formattedCart;
        }
        
        next();
    } catch(error) {
        next(error);
    }
}
