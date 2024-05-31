const jwt = require('jsonwebtoken');

const accessToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            aud:userId._id
        };
        const options = {
            issuer: "OASIX"
        };
        const secret = process.env.SECRET_KEY;
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}
const verifyToken = async (req, res, next) => {
    try {
        const headerTokn = req.headers['authorization'];
        if (!headerTokn || headerTokn === undefined) {
            return res.status(401).json({ message: 'Token is required' })
        }
        const bearerToken = headerTokn.split(' ');
        const token = bearerToken[1];
        jwt.verify(token, process.env.SECRET_KEY, async (err, value) => {
            if (err) {
                return res.status(401).json({ message: 'Token is expired' })
            }
            else {
                req.user = value.aud;
                next();
            }
        })
    } catch (error) {
        res.status(404).json({ message: error.message })

    }
}

module.exports = { verifyToken, accessToken }