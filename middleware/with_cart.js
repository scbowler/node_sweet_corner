const jwt = require('jwt-simple');
const { cartSecret } = require('../config').jwt;
const db = require('../db');

module.exports = async (req, res, next) => {
    try {
        const { 'x-cart-token': cartToken } = req.headers;
        req.cart = null;

        const [[cartStatus = null]] = await db.query(
            'SELECT id FROM cartStatuses WHERE mid="active"'
        );

        if(!cartStatus){
            throw new StatusError(500, 'Error retrieving cart data');
        }

        const cartQuery = `SELECT c.id AS cartId, c.lastInteraction, c.pid, c.createdAt,
                    c.updatedAt, c.userId, c.statusId AS cartStatusId,
                    ci.quantity, p.cost, p.id AS productId FROM carts AS c 
                    JOIN cartItems AS ci ON ci.cartId=c.id
                    JOIN products AS p ON ci.productId=p.id
                    WHERE c.deletedAt IS NULL AND ci.deletedAt IS NULL AND c.statusId=${cartStatus.id} `;
        let cartWhere = null;

        if(req.user){
            cartWhere  = ` AND c.userId=${req.user.id}`;
        } else if(cartToken){
            const cartData = jwt.decode(cartToken, cartSecret);
            cartWhere = ` AND c.id=${cartData.cartId}`;
        }

        if(cartWhere){
            const [cart = null] = await db.query(
                cartQuery + cartWhere
            );

            if(cart){
                const { cost, quantity, productId, ...cartItem } = cart[0];

                const formattedCart = {
                    ...cartItem,
                    items: cart.map((item) => {
                        return {
                            cost: item.cost,
                            id: item.productId,
                            quantity: item.quantity
                        }
                    })
                };

                req.cart = formattedCart;
            }
        }
        
        next();
    } catch(error) {
        next(error);
    }
}
