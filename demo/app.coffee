express     = require 'express'
path        = require 'path'
consolidate = require 'consolidate'

app = express()
app.use '/dist', express.static(path.join(__dirname, '..', 'dist'))
app.use '/docs', express.static(path.join(__dirname, '..', 'docs'))
app.use '/', express.static(path.join(__dirname, 'app'))

app.set 'view engine', 'html'
app.set 'views', path.join(__dirname, 'app', 'views')
app.engine '.html', consolidate.swig

for i in [1..13] then do (i) ->
  app.get "/#{i}", (req, res) -> res.render "demo#{i}"

app.listen(5000)
console.log('Listening on port 5000')
