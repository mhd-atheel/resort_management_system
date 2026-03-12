const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET_KEY;

const signJwt = (payload, options = { expiresIn: "1h" }) => {
    return jwt.sign(payload, SECRET, options);
};

const verifyJwt = (token) => {
    return jwt.verify(token, SECRET);
};


const decodeJwt = (token) => jwt.decode(token);

module.exports = {
    signJwt,
    verifyJwt,
    decodeJwt
}
