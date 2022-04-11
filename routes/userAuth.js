const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')

// create a user
router.post('/create-user',
	[
		body('username', 'Username should contain at least 4 characters').isLength({ min: 4 }),
		body('email', 'Invalid Email').isEmail(),
		body('password', 'Password should container at least 8 characters').isLength({ min: 8 })
	],
	async (req, res) => {
		let success = false
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			success = false
			res.status(400).json({ success, errors })
		} else {
			try {
				const { username, email, password } = req.body

				const existingUsername = await User.findOne({ username })
				const existingEmail = await User.findOne({ email })
				if (existingUsername) {
					success = false
					res.status(500).json({ success, error: 'Username not available' })
				} else if (existingEmail) {
					success = false
					res.status(500).json({ success, error: 'User with this email already exists' })
				} else {
					const salt = await bcrypt.genSalt(10)
					const hashedPassword = await bcrypt.hash(password, salt)

					const newUser = await User.create({
						username, email, password: hashedPassword
					})

					success = true
					res.json({ success, newUser })
				}
			} catch (error) {
				success = false
				res.status(500).json({ success, error })
			}
		}
	}
)

// user login
router.post('/login',
[
	body('')
]
)

module.exports = router