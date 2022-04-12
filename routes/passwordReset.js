const express = require('express')
const router = express.Router()
const User = require('../models/user')
const sendEmail = require('../utils/sendEmail')
const { body, param, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
require('dotenv').config()

// send forgot password link
router.post('/using-email',
	[
		body('email', 'Invalid email').isEmail()
	],
	async (req, res) => {
		let success = false

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			success = false
			res.status(400).json({ success, errors })
		} else {
			try {
				const { email } = req.body

				const user = await User.findOne({ email })
				if (!user) {
					success = false
					res.status(400).json({ success, error: 'User with the given email doesn\'t exists' })
				} else {
					const link = `${process.env.BASE_URL}/reset-password/${user._id}`
					await sendEmail(user.email, "Password Reset", `Reset Password on following link: ${link}`)
					res.send('sent')
				}
			} catch (error) {
				success = false
				res.status(500).json({ success, error })
			}
		}
	}
)

// reset the password
router.post('/:userId',
	[
		param('userId', 'Appropriate user Id must exist').exists(),
		body('newPassword', 'Password must contain at least 8 characters').isLength({ min: 8 })
	],
	async (req, res) => {
		let success = false

		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			success = false
			res.status(400).json({ success, errors })
		} else {
			try {
				const { userId } = req.params
				const { newPassword } = req.body

				const user = await User.findById(userId)
				if (!user) {
					success = false
					res.status(400).json({ success, error: 'Invalid Link' })
				} else {

					const salt = await bcrypt.genSalt(10)
					const newHashedPassword = await bcrypt.hash(newPassword, salt)

					user.password = newHashedPassword
					await user.save()

					success = true
					res.json({ success, msg: 'Password reset successfully' })
				}
			} catch (error) {
				success = false
				res.status(500).json({ success, error })
			}
		}
	}
)

module.exports = router