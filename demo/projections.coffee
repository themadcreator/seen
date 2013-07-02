seen = (exports ? this).seen ?= {}

seen.perpective100x100 = () ->
  scene = new seen.Scene
    cullBackfaces : false
    projection    : seen.Projections
      .frustum(-100, 100, -100, 100, 100, 300)
  
  # lights
  scene.lights.points.push new seen.Light
    point     : new seen.Point(-80, 120, 220)
    intensity : 0.005

  scene.lights.ambients.push new seen.Light
    intensity : 0.002

  cube = seen.Shapes.cube()
    .fill(new seen.Colors.fromHsl(0.3, 0.5, 0.4))
    .scale(0.3)
    .rotx(0.3)
    .roty(5.2)
    .rotz(0.1)

  outlinecube = seen.Shapes.cube()
    .fill(null)
    .stroke(new seen.Colors.fromHex('#CCCCCC'))

  girth = 0.01

  scene.group.append()
    .scale(100)
    .translate(0,0,-200)
    .add(outlinecube)
    .add(cube)
    # +X
    .add(
      seen.Shapes.rectangle(
        new seen.Point(-1, -1, 1)
        new seen.Point( 1, -1 + girth, 1 - girth)
      ).fill(new seen.Colors.fromHex('#FF0000'))
    )
    # +Y
    .add(
      seen.Shapes.rectangle(
        new seen.Point(-1, -1, 1)
        new seen.Point(-1 + girth, 1, 1 - girth)
      ).fill(new seen.Colors.fromHex('#00FF00'))
    )
    # -Z
    .add(
      seen.Shapes.rectangle(
        new seen.Point(-1, -1, -1)
        new seen.Point(-1 + girth, -1 + girth,  1)
      ).fill(new seen.Colors.fromHex('#0000FF'))
    )
    
  scene.on 'beforeRender', ->
    cube.roty(0.01)

  return scene
