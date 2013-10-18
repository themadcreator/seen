# Read wavefront OBJ file, output JSON.
# NOTE: WAVEFRONT OBJ ARRAY INDICES ARE 1-BASED!!!!

obj = {
  create : ->
    return {vertices : [], faces : []}
  v : (geom, data) ->
    geom.vertices.push data.map (d) -> parseFloat(d)
  f : (geom, data) ->
    geom.faces.push data.map (d) -> parseInt(d)
}

geom = obj.create()

fs       = require 'fs'
readline = require('readline')
rl = readline.createInterface
  input    : fs.createReadStream('assets/teapot.obj')
  terminal : false

rl.on 'line', (line) ->
  data    = line.split(' ')
  command = data.slice(0,1)
  data    = data.slice(1)
  obj[command]?(geom, data)

rl.on 'close', ->
  fs.writeFile 'assets/teapot.json', JSON.stringify(geom), -> console.log 'done'
