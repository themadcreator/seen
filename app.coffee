express = require 'express'
path    = require 'path'

app = express()
app.use('/dist', express.static(path.join(__dirname, 'dist')))
app.use('/', express.static(path.join(__dirname, 'demo')))
app.listen(5000)
console.log('Listening on port 5000')