const jwt = require('jsonwebtoken');
module.exports = function(payload) {
    return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN || '90d'
    });
};