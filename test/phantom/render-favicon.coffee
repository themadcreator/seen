
initPage = (page) ->
  page.onConsoleMessage = (msg) -> console.log(msg)
  page.onError = (msg) -> console.error(msg)

  width  = 260
  height = 260

  page.setContent """
  <body style="padding:0 0 0 0;margin:0 0 0 0;">
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

page = require('webpage').create()
initPage(page)
page.evaluate(->
  width  = 260
  height = 260
  shape  = seen.Shapes.sphere(1).scale(110).roty(0.2).rotx(0.1)
  seen.Colors.randomSurfaces2(shape)
  model  = seen.Models.default().add(shape)
  scene  = new seen.Scene
    model  : model
    camera : new seen.Camera
      viewport : seen.Viewports.center(width, height)
  seen.Context('seen-canvas', scene).render()
)

# Further generation done with http://realfavicongenerator.net/
page.render('favicon-260x260.png')
phantom.exit()