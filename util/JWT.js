const jwt = require("jsonwebtoken")
const secret = "jerry-anydata"
const JWT = {
    generate(value, expires) {
        return jwt.sign(value, secret, { expiresIn: expires })
    },
    verify(token) {
        try {
            return jwt.verify(token, secret)
        } catch (error) {
            console.error(error.message);
            return false
        }
    }
}

module.exports = JWT