

initPage = (page) ->
  page.onConsoleMessage = (msg) -> console.log(msg)
  page.onError = (msg) -> console.error(msg)

  width  = 100
  height = 100

  page.setContent """
  <body style="background-color:white;padding:0 0 0 0;margin:0 0 0 0;">
  <canvas id="seen-canvas" width="#{width}" height="#{height}"></canvas>
  </body>
  """, 'test.html'

  page.viewportSize = {
    width  : width
    height : height
  }

  page.clipRect = {
    top    : 0
    left   : 0
    width  : width
    height : height 
  }

  page.injectJs('dist/latest/seen.min.js')

evaluateScene = (page, scene) ->
  page.evaluate(->
    window.test = do ->
      @width  = 100
      @height = 100
      @model  = seen.Models.default()
      @scene  = new seen.Scene
        model  : @model
        camera : new seen.Camera
          viewport : seen.Viewports.center(@width, @height)
      @context = seen.Contexts.createWithScene('seen-canvas', @scene, @width, @height)
      return @
  )
  page.evaluate(scene.script)
  page.evaluate(->
    window.test.context.render()
  )

scenes = require('./phantom-scenes')
for scene in scenes
  page = require('webpage').create()
  initPage(page)
  evaluateScene(page, scene)
  page.render("test/phantom/renders/#{scene.png}")
  
phantom.exit()
