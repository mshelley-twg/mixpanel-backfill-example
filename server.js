const express = require('express')
const dotenv = require('dotenv')
const routes = require('./routes')
dotenv.config()

const app = express()
app.use(routes)

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}`)
})
