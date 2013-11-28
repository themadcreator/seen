express     = require 'express'
path        = require 'path'
consolidate = require 'consolidate'
demos       = require './demos'

app = express()
app.use '/dist',   express.static(path.join(__dirname, '..', 'dist'))
app.use '/docs',   express.static(path.join(__dirname, '..', 'docs'))
app.use '/lib',    express.static(path.join(__dirname, 'app', 'lib'))
app.use '/assets', express.static(path.join(__dirname, 'app', 'assets'))

app.set 'view engine', 'html'
app.set 'views', path.join(__dirname, 'app', 'views')
app.engine '.html', consolidate.swig

for i in [1..14] then do (i) ->
  app.get "/#{i}", (req, res) -> res.render "demo#{i}"

for demo, i in demos then do (demo, i) ->
  demo.prev = demos[i - 1]
  demo.next = demos[i + 1]
  app.get "/#{demo.view}", (req, res) -> res.render demo.view, demo

app.get '/', (req,res) -> res.render 'index', {demos}

app.listen(5000)
console.log('Listening on port 5000')
