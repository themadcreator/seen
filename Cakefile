

# TODO - actually add to top of minified... 
LICENSE = "/* Copyright github/TheMadCreator #{new Date().getFullYear()} */\n\n"

DISTS = {
  'seen.js' : [
    'src/seen.math.coffee'
    'src/seen.geom.coffee'
    'src/seen.camera.coffee'
    'src/seen.light.coffee'
    'src/seen.canvas.coffee'
    'src/seen.coffee'
  ]
}

# =======
# TASKS
# =======

fs           = require 'fs'
path         = require 'path'
UglifyJS     = require 'uglify-js'
CoffeeScript = require 'coffee-script'

task 'build', 'Build and uglify seen', build = (cb) ->

  if not fs.existsSync(path.join(__dirname, 'dist')) then fs.mkdirSync(path.join(__dirname, 'dist'))

  for javascript, sources of DISTS
    code = ''
    for source in sources
      code += CoffeeScript.compile fs.readFileSync(source, 'utf-8')

    fs.writeFileSync path.join(__dirname, 'dist', javascript), code, {flags: 'w'}

    ugly = UglifyJS.minify path.join(__dirname, 'dist', javascript),
      outSourceMap : "#{javascript}.map"

    fs.writeFileSync path.join(__dirname, 'dist', javascript.replace(/\.js$/,'.min.js')), ugly.code, {flags: 'w'}
    fs.writeFileSync path.join(__dirname, 'dist', "#{javascript}.map"), ugly.map, {flags: 'w'}

    console.log "Minified #{javascript}"

  cb() if typeof cb is 'function'

 