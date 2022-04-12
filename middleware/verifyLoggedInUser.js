const jwt = require('jsonwebtoken')
require('dotenv').config()

const jwtSecret = process.env.JWT_SECRET

const verifyLoggedInUser = (req, res, next) => {
	let success = false

	try {
		const token = req.header('auth-token')
		if (!token) {
			success = false
			res.status(400).json({ success, error: 'Authentication token not found' })
		} else {
			const payload = jwt.verify(token, jwtSecret)
			req.user = payload.user

			next()
		}
	} catch (error) {
		success = false
		res.status(500).json({ success, error: 'okoko' })
	}
}

module.exports = verifyLoggedInUser