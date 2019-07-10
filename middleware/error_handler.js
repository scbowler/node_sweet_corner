module.exports = (error, req, res, next) => {
    if (error instanceof StatusError) {
        res.status(error.status).send({ errors: error.messages });
    } else {
        console.log('Error:', error);
        res.status(500).send({ errors: ['Internal server error'] });
    }
}
