

# TODO - actually add to top of minified... 
LICENSE = "/* Copyright github/TheMadCreator #{new Date().getFullYear()} */\n\n"

DISTS = {
  'seen.js' : [
    'src/seen.namespace.coffee'
    'src/seen.util.coffee'
    'src/seen.math.coffee'
    'src/seen.materials.coffee'
    'src/seen.light.coffee'
    'src/seen.geom.coffee'
    'src/seen.painters.coffee'
    'src/seen.shapes.coffee'
    'src/seen.camera.coffee'
    'src/seen.canvas.coffee'
    'src/seen.scene.coffee'
  ]
}

# =======
# TASKS
# =======

fs           = require 'fs'
path         = require 'path'
{exec}       = require 'child_process'
UglifyJS     = require 'uglify-js'
CoffeeScript = require 'coffee-script'

task 'build', 'Build and uglify seen', () ->

  # Prepare output path
  if not fs.existsSync(path.join(__dirname, 'dist')) then fs.mkdirSync(path.join(__dirname, 'dist'))

  for javascript, sources of DISTS
    console.log  "Building #{javascript}..."

    # Concat all coffeescript together for Docco
    coffeeCode = sources.map((source) -> fs.readFileSync(source, 'utf-8')).join('\n\n')
    fs.writeFileSync path.join(__dirname, 'dist', javascript.replace(/\.js$/, '.coffee')), coffeeCode, {flags: 'w'}
    console.log "Joined."

    # Compile to javascript
    jsCode = CoffeeScript.compile coffeeCode
    fs.writeFileSync path.join(__dirname, 'dist', javascript), jsCode, {flags: 'w'}
    console.log "Compiled."

    # Uglify
    ugly = UglifyJS.minify path.join(__dirname, 'dist', javascript),
      outSourceMap : "#{javascript}.map"
    fs.writeFileSync path.join(__dirname, 'dist', javascript.replace(/\.js$/,'.min.js')), ugly.code, {flags: 'w'}
    fs.writeFileSync path.join(__dirname, 'dist', "#{javascript}.map"), ugly.map, {flags: 'w'}

    console.log "Minified."


task 'docs', 'Build seen documentation', (options) ->
  for javascript, sources of DISTS
    coffee = path.join(__dirname, 'dist', javascript.replace(/\.js$/, '.coffee'))
    script = path.join(__dirname, 'node_modules' , 'docco', 'bin', 'docco')
    exec("#{script}  #{coffee}", (err) -> throw err if err)

 