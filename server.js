const Express = require('express')
const route = require('./routes/routes')
const connectDb = require('./config/billConfiq')
require('dotenv/config')
const app = Express()
app.use(Express.json())

const {PORT} = process.env

connectDb()

app.use('/api', route)

app.listen(PORT, () => {
  console.log((new Date().toLocaleDateString()), PORT);
})