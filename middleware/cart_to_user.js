const db = require(__root + '/db');

module.exports = async (req, res, next) => {
    try {
        if (req.cart && req.cart.userId){
            if(req.cart.userId !== req.user.id){
                throw new StatusError(401, 'Illegal cart token');
            }

            return next();
        }

        if(req.cart){
            const [[cartStatus]] = await db.query(
                'SELECT id FROM cartStatuses WHERE mid="active"'
            );

            if(cartStatus.id === req.cart.cartStatusId){
                await db.query(
                    `UPDATE carts SET userId=${req.user.id} WHERE id=${req.cart.cartId}`
                );
            }
        }

        next();
    } catch(err){
        next(err);
    }
}
