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

app.get '/1', (req, res) -> res.render 'demo1'
app.get '/2', (req, res) -> res.render 'demo2'
app.get '/3', (req, res) -> res.render 'demo3'
app.get '/4', (req, res) -> res.render 'demo4'
app.get '/5', (req, res) -> res.render 'demo5'
app.get '/6', (req, res) -> res.render 'demo6'

app.listen(5000)
console.log('Listening on port 5000')
