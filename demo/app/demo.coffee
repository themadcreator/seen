seen.demo = {}

seen.demo.model = () ->
  model = new seen.Model()

  model.lights.push seen.Lights.point
    point     : seen.P(-80, 120, 220)
    intensity : 0.005

  model.lights.push seen.Lights.directional
    point     : seen.P(-80, 120, 220)
    color     : seen.C.hsl(0.1, 0.5, 0.5)
    intensity : 0.003

  model.lights.push seen.Lights.ambient
    intensity : 0.002

  return model

seen.demo.text = () ->
  model = seen.demo.model()
  scene.projection = seen.Projections.orthoExtent()

  # shapes!
  rect = seen.Shapes.rectangle(
    new seen.Point(-50, -20, -20)
    new seen.Point( 50,  20,  20)
  )

  text = new seen.Shapes.text('Hello, world!')
    .scale(1,-1,1)
    .translate(0,0,25)

  scene.group.append()
    .add(rect)
    .add(text)
  scene.group.eachShape randomColors

  scene.group.roty(-0.5).rotz(-0.5)
  scene.on 'beforeRender.animate', () ->
    rect.rotx(0.02)
    text.rotx(0.02)

  return scene

seen.demo.tetrahedra = () ->
  model = seen.demo.model()

  # shapes!
  model.add(seen.Shapes.unitcube().scale(30))
  model.add(seen.Shapes.tetrahedron().scale(10).translate(50,50))
  model.add(seen.Shapes.tetrahedron().scale(10).roty(0.5 * Math.PI).translate(-50,30))

  inside     = model.append()
  outside    = model.append()
  faroutside = model.append()
  around     = model.append()

  for i in [0...360] by 4
    inside.add     seen.Shapes.tetrahedron().scale(1).translate(-70).roty(i / 180.0 * Math.PI).rotz(0.5 * Math.sin(i / 60  * Math.PI))
    outside.add    seen.Shapes.tetrahedron().scale(2).translate(0,-90).rotz(i / 180.0 * Math.PI).rotx(0.125 * Math.sin(i / 30  * Math.PI))
    faroutside.add seen.Shapes.tetrahedron().scale(3).translate(0,-120).rotz(i / 180.0 * Math.PI).rotx(0.25 * Math.sin(i / 30  * Math.PI))

  for i in [0...360] by 3
    around.add seen.Shapes.tetrahedron().scale(1).translate(0,-50)
      .rotz(i / 180.0 * Math.PI).rotx(0.25 * Math.sin(i / 30  * Math.PI))
      .roty(1)
      .rotz(1)

  model.eachShape randomColors
  model.scale(1.5)

  return {
    model
    inside
    outside
    faroutside
    around
  }

randomColors = (shape) ->
  hue = Math.random()
  for surface in shape.surfaces
    surface.fill = new seen.Material seen.C.hsl(hue, 0.5, 0.4)

