const jwt = require('jwt-simple');
const db = require(__root + '/db');
const { authSecret } = require(__root + '/config').jwt;

module.exports = async (req, res, next) => {
    try {
        const { authorization = null } = req.headers;
        req.user = null;

        if(authorization){
            let tokenData = null;

            try {
                tokenData = jwt.decode(authorization, authSecret);
            } catch(err){
                throw new StatusError(401, 'Invalid auth token');
            }

            const [[user = null]] = await db.execute(
                'SELECT * FROM users WHERE id=?',
                [tokenData.id]
            );

            req.user = user;
        }

        next();
    } catch(err) {
        next(err);
    }
}
