module.exports = (req, res, next) => {
    try {
        
        res.send({
            message: 'Get cart endpoint',
            cart: req.cart
        });
    } catch(error){
        next(error);
    }
}
