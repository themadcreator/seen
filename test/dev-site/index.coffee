express = require 'express'
path    = require 'path'
fs      = require 'fs'
options = require '../../site/options'

app = express()

app.configure ->
  app.engine('html', require('swig').renderFile)
  app.set('view engine', 'html')
  app.set('views', path.join(__dirname))

  app.use '/lib', express.static(path.join(__dirname, '..' , '..', 'dist', 'latest'))

  app.get '/', (req,res) ->
    res.render 'template', {
      scripts : [
        'lib/seen.min.js'
        options.cdns.lodash.script
        options.cdns.jquery.script
      ]
      width  : 800
      height : 800
      ready  : String(require './dev')
    }

server = app.listen 5050, ->
  console.log('Listening on port %d', server.address().port)

process.once 'SIGUSR2', ->
  console.log 'Received SIGUSR2, closing server'
  server.close()
  setTimeout((-> process.kill(process.pid, 'SIGUSR2')), 1000)
