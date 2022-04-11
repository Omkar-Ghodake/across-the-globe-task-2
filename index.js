const express = require('express')
const app = express()
const connectToMongo = require('./db')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

connectToMongo()
const port = process.env.PORT

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())

app.use('/', require('./routes/userAuth'))

app.listen(port, () => {
	console.log(`App running on http://localhost:${port}`)
})