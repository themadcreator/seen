seen.demo = {}

seen.demo.text = () ->
  model = seen.Models.default()

  rect = seen.Shapes.rectangle(
    new seen.Point(-20, -20, -20)
    new seen.Point( 20,  20,  20)
  )
  seen.Colors.randomShape(rect)
  dice = model.append().add(rect)


  faces = [1..6].map (i) ->
    text = new seen.Shapes.text(i).translate(0, 0, 25)
    text.fill new seen.Material seen.Colors.black()
    dice.add(text)
    return text

  faces[1].roty(-Math.PI/2)
  faces[2].rotx(Math.PI/2)
  faces[3].rotx(-Math.PI/2)
  faces[4].roty(Math.PI/2)
  faces[5].roty(Math.PI)

  model.scale(3).roty(-0.5).rotz(-0.5)

  scene = new seen.Scene
    model  : model
    camera : new seen.Camera
      projection : seen.Projections.ortho()

  return scene

seen.demo.tetrahedra = () ->
  model = seen.Models.default()

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

  for i in [0...360] by 8
    around.add seen.Shapes.tetrahedron().scale(1).translate(0,-50)
      .rotz(i / 180.0 * Math.PI).rotx(0.25 * Math.sin(i / 30  * Math.PI))
      .roty(1)
      .rotz(1)

  model.eachShape seen.Colors.randomShape
  model.scale(1.5)

  return {
    model
    inside
    outside
    faroutside
    around
  }
