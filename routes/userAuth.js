const express = require('express')
const router = express.Router()
const User = require('../models/user')
const { body, param, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const verifyLoggedInUser = require('../middleware/verifyLoggedInUser')
require('dotenv').config()

// environment variables
const jwtSecret = process.env.JWT_SECRET

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
		body('username', 'Username should contain at least 4 characters').isLength({ min: 4 }),
		body('password', 'Password should container at least 8 characters').isLength({ min: 8 })
	],
	async (req, res) => {
		let success = false

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			res.status(400).json({ success, errors })
		} else {
			try {
				const { username, password } = req.body

				const user = await User.findOne({ username })
				if (!user) {
					success = false
					res.status(400).json({ success, error: 'Username not found' })
				} else {
					const passwordCompare = await bcrypt.compare(password, user.password)
					if (!passwordCompare) {
						success = false
						res.status(400).json({ success, error: 'Invalid Password' })
					} else {
						const payload = {
							user: {
								id: user.id
							}
						}

						const authToken = jwt.sign(payload, jwtSecret)

						success = true
						res.json({ success, authToken })
					}
				}
			} catch (error) {
				success = false
				res.status(500).json({ success, error })
			}
		}
	}
)

// get user data
router.get('/get-user/:userId',
	verifyLoggedInUser,
	[
		param('id', 'Invalid User Id').exists()
	],
	async (req, res) => {
		let success = false

		try {
			const { userId } = req.params
			const userData = await User.findById(userId).select('-password')
			if (userData) {
				success = true
				res.json({ success, userData })
			} else {
				success = false
				res.status(400).json({ success, error: 'User not found' })
			}

		} catch (error) {
			success = false
			res.status(500).json({ success, error })
		}
	}
)

module.exports = router