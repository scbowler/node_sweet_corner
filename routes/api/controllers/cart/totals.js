module.exports = (req, res, next) => {
    try {
        let total = null;

        if(req.cart){
            const start = { cost: 0, items: 0 };

            total = req.cart.items.reduce(({cost, items}, item) => {
                return {
                    cost: (item.cost * item.quantity) + cost,
                    items: items + item.quantity
                }
            }, start);
        }

        res.send({
            total
        });
    } catch(error) {
        next(error);
    }
}
