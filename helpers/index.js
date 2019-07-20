const jwt = require('jwt-simple');
const { authSecret } = require('../config').jwt;

exports.imageUrl = (req, type, file) => {
    return `${req.protocol}://${req.get('host')}/images/${type}/${file}`;
}

exports.createAuthToken = id => {
    const tokenData = {
        id,
        created: Date.now()
    };

    const token = jwt.encode(tokenData, authSecret);

    return token;
}
