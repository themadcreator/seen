path         = require 'path'
childProcess = require 'child_process'
fs           = require 'fs'
phantomjs    = require 'phantomjs'
pngjs        = require 'pngjs'
{assert}     = require 'chai'
Q            = require 'q'

TAG_TYPES = [
  'svg'
  'canvas'
]

RENDERS = [
  'lights-ambient'
  'lights-directional'
  'lights-point'
  'materials-metallic'
  'materials-opacity'
  'materials-specular'
  'materials-stroke'
  'shaders-ambient'
  'shaders-diffuse'
  'shaders-flat'
  'shaders-phong'
  'shapes-cube'
  'shapes-icosahedron-0'
  'shapes-icosahedron-1'
  'shapes-icosahedron-2'
  'shapes-icosahedron-3'
  'shapes-icosahedron-4'
  'shapes-patch'
  'shapes-tetrahedon'
]

compareRenders = (pathCanonical, pathTest, done) ->
  promises = [pathCanonical, pathTest].map (pathPng) ->
    defer = Q.defer()
    fs.createReadStream(pathPng)
      .pipe(new pngjs.PNG({filterType : 4}))
      .on('parsed', -> defer.resolve(@))
    return defer.promise

  return Q.all(promises)
  .spread((pngCanonical, pngTest) ->
    # Sadly, we can't just compare the buffers with deepEquals because mocha stalls
    assert.equal(pngCanonical.data.length, pngTest.data.length)
    for i in [0...pngCanonical.data.length]
      assert.equal(pngCanonical.data[i], pngTest.data[i])
    return
  )
  .done(done)

describe 'render smoke test', ->
  it 'renders test scenes without errors', (done) ->
    testPath = path.join(__dirname, '..', 'phantom', 'render-scenes.coffee')
    childProcess.execFile(phantomjs.path, [testPath], (err, stdout, stderr) ->
      assert.propertyVal(stdout, 'length', 0)
      assert.propertyVal(stderr, 'length', 0)
      done(err)
    )

  describe 'rendered all test scenes', () ->
    TAG_TYPES.forEach (tagType) ->
      RENDERS.forEach (render) ->
        it "rendered #{tagType} #{render}", ->
          assert(fs.existsSync(path.join(__dirname, '..', 'phantom', 'renders', "#{tagType}-#{render}.png")))

  describe 'all renders match canonical renders', () ->
    TAG_TYPES.forEach (tagType) ->
      RENDERS.forEach (render) ->
        it "rendered #{tagType} #{render} matches canonical", (done) ->
          compareRenders(
            path.join(__dirname, '..', 'phantom', 'canonical', "#{tagType}-#{render}.png")
            path.join(__dirname, '..', 'phantom', 'renders', "#{tagType}-#{render}.png")
            done
          )
