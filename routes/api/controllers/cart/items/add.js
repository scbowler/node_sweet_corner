module.exports = async (req, res, next) => {
    try {
        // const { product_id } = req.params;
        const { body: { quantity }, params: { product_id } } = req;

        res.send({
            message: 'Add item to cart',
            product_id,
            quantity
        });
    } catch(error){
        next(error);
    }
}
