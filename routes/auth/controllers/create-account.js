const bcrypt = require('bcrypt');
const db = require(__root + '/db');

module.exports = async (req, res, next) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        const errors = [];

        if (!email) {
            errors.push('No email provided');
        }

        if (!firstName) {
            errors.push('No first name provided');
        }

        if (!lastName) {
            errors.push('No last name provided');
        }

        if (!password) {
            errors.push('No password provided');
        } else if (password.length < 6) {
            errors.push('Password is too short');
        }

        if (errors.length) {
            throw new StatusError(422, errors);
        }

        const [[existingUser = null]] = await db.execute(
            'SELECT id FROM users WHERE email=?',
            [email]
        );

        if (existingUser) {
            throw new StatusError(422, 'Email already in use');
        }

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(password, salt);

        const [[role = null]] = await db.query('SELECT id FROM userRoles WHERE mid="customer"');

        if (!role) {
            throw new StatusError(500, 'Internal server error');
        }

        const [result] = await db.execute(
            `INSERT INTO users 
                (firstName, lastName, email, password, pid, roleId, lastAccessedAt, createdAt, updatedAt) 
                VALUES (?, ?, ?, ?, UUID(), ?, CURRENT_TIME, CURRENT_TIME, CURRENT_TIME)`,
            [firstName, lastName, email, hashedPassword, role.id]
        );

        const [[user]] = await db.query(`SELECT CONCAT(firstName, ' ', lastName) AS name, email, pid FROM users WHERE id=${result.insertId}`);

        res.send({
            message: 'Account successfully created',
            user
        });
    } catch (error) {
        next(error);
    }
}
