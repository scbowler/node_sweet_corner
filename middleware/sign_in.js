const bcrypt = require('bcrypt');
const db = require('../db');
const { createAuthToken } = require('../helpers');

module.exports = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const errors = [];

        if (!email) {
            errors.push('No email received');
        }

        if (!password) {
            errors.push('No password received');
        }

        if (errors.length) {
            throw new StatusError(422, errors);
        }

        const [[foundUser = null]] = await db.execute(
            'SELECT id, CONCAT(firstName, " ", lastName) AS name, email, pid, password as hash FROM users WHERE email=?',
            [email]
        );

        if (!foundUser) {
            throw new StatusError(401, 'Invalid email and/or password');
        }

        const { hash, ...user } = foundUser;

        const passwordsMatch = await bcrypt.compare(password, hash);

        if (!passwordsMatch) {
            throw new StatusError(401, 'Invalid email and/or password');
        }

        req.user = {
            token: createAuthToken(user.id),
            ...user
        }

        next();
    } catch (error) {
        next(error)
    }
}
