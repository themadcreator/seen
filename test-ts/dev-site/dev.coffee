module.exports = ->
  shape = new seen.Shape('tri', [new seen.Surface([
    seen.P(-1, -1, 0)
    seen.P( 1, -1, 0)
    seen.P( 0,  1, 0)
  ])]).scale(height * 0.2)
  shape.fill(new seen.Material(seen.Colors.gray()))


  #shape = seen.Shapes.sphere(2).scale(height * 0.4)
  #seen.Colors.randomSurfaces2(shape)


  model = new seen.Model().add(shape)

  model.add seen.Lights.directional
    normal    : seen.P(-1, 1, 1).normalize()
    color     : seen.Colors.hex('#FF0000')
    intensity : 0.01

  model.add seen.Lights.directional
    normal    : seen.P(1, 1, -1).normalize()
    color     : seen.Colors.hex('#0000FF')
    intensity : 0.01

  scene = new seen.Scene
    model    : model
    viewport : seen.Viewports.center(width, height)
  context = seen.Context('seen-canvas', scene).render()
  dragger = new seen.Drag('seen-canvas', {inertia : true})
  dragger.on('drag.rotate', (e) ->
    shape.transform seen.Quaternion.xyToTransform(e.offsetRelative...)
    context.render()
  )
