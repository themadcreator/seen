express     = require 'express'
path        = require 'path'
consolidate = require 'consolidate'
swig        = require 'swig'

swig.init {root : path.join(__dirname, 'demo', 'views')}

app = express()
app.use '/dist', express.static(path.join(__dirname, 'dist'))
app.use '/docs', express.static(path.join(__dirname, 'docs'))
app.use '/doc', express.static(path.join(__dirname, 'doc'))
app.use '/', express.static(path.join(__dirname, 'demo'))

app.set 'view engine', 'html'
app.set 'views', path.join(__dirname, 'demo', 'views')
app.engine '.html', consolidate.swig

app.get '/1', (req, res) -> res.render 'demo1'
app.get '/2', (req, res) -> res.render 'demo2'

app.listen(5000)
console.log('Listening on port 5000')