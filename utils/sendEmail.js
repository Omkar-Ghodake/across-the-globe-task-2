const nodemailer = require('nodemailer')
require('dotenv').config()

const sendEmail = async (email, subject, text) => {
	try {
		const transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			service: process.env.EMAIL_SERVICE,
			port: 587,
			secure: true,
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD
			},
			tls: {
				// do not fail on invalid certs
				rejectUnauthorized: false
			}
		})

		await transporter.sendMail({
			from: process.env.EMAIL_USER,
			to: email,
			subject,
			text
		})

		console.log('Email sent successfully')
	} catch (error) {
		console.log(error, 'Email not sent')
	}
}

module.exports = sendEmail