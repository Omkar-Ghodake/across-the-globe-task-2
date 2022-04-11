const mongoose = require('mongoose')
require('dotenv').config()

const mongoUri = process.env.MONGO_URI

const connectToMongo = () => {
	mongoose.connect(mongoUri, () => {
		console.log('Connected to Mongo successfully.')
	})
}

module.exports = connectToMongo