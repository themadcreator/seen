express   = require 'express'
path      = require 'path'

app = express()
app.use '/', express.static(path.join(__dirname, '..', 'site-dist'))
server = app.listen 5000, -> console.log('Listening on port %d', server.address().port)
