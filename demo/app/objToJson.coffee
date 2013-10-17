fs = require 'fs'

#threeobj = require('three-obj')()
#threeobj.load 'assets/teapot.obj', (response) -> fs.writeFile 'assets/teapot.json', JSON.stringify(response), -> console.log 'done'



readline = require('readline')

rl = readline.createInterface
  input    : fs.createReadStream('assets/teapot.obj')
  terminal : false

obj = {
  create : ->
    return {vertices : [], faces : []}
  v : (geom, data) ->
    geom.vertices.push data.map (d) -> parseFloat(d)
  f : (geom, data) ->
    geom.faces.push data.map (d) -> parseInt(d)
}

geom = obj.create()

rl.on 'line', (line) ->
  data    = line.split(' ')
  command = data.slice(0,1)
  data    = data.slice(1)
  obj[command]?(geom, data)

rl.on 'close', ->
  fs.writeFile 'assets/teapot2.json', JSON.stringify(geom), -> console.log 'done'
