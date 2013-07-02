seen = (exports ? this).seen ?= {}


seen.emptyScene = () ->
  scene = new seen.Scene()

  # center-ize projection/camera matrix
  scene.projection = seen.Projections.perspectiveFov(55)

  # lights
  scene.lights.points.push new seen.Light
    point: new seen.Point(-80, 120, 220)
    intensity: 0.005

  scene.lights.ambients.push new seen.Light
    intensity: 0.002

  return scene

seen.demoText = () ->
  scene = seen.emptyScene()
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

seen.demoScene = () ->
  scene = seen.emptyScene()

  # shapes!
  scene.group.add(seen.Shapes.unitcube().scale(30))
  scene.group.add(seen.Shapes.tetrahedron().scale(10).translate(50,50))
  scene.group.add(seen.Shapes.tetrahedron().scale(10).roty(0.5 * Math.PI).translate(-50,30))
 
  inside     = scene.group.append()
  outside    = scene.group.append()
  faroutside = scene.group.append()
  around     = scene.group.append()

  for i in [0...360] by 4
    inside.add     seen.Shapes.tetrahedron().scale(1).translate(-70).roty(i / 180.0 * Math.PI).rotz(0.5 * Math.sin(i / 60  * Math.PI))
    outside.add    seen.Shapes.tetrahedron().scale(2).translate(0,-90).rotz(i / 180.0 * Math.PI).rotx(0.125 * Math.sin(i / 30  * Math.PI))
    faroutside.add seen.Shapes.tetrahedron().scale(3).translate(0,-120).rotz(i / 180.0 * Math.PI).rotx(0.25 * Math.sin(i / 30  * Math.PI))

  for i in [0...360] by 3
    around.add seen.Shapes.tetrahedron().scale(1).translate(0,-50)
      .rotz(i / 180.0 * Math.PI).rotx(0.25 * Math.sin(i / 30  * Math.PI))
      .roty(1)
      .rotz(1)

  scene.group.eachShape randomColors

  scene.group
    .scale(0.3)
    .translate(0,0,-100)

  scene.on 'beforeRender.animate', () ->
    for i in [0...3]
      scene.group.children[i].rotx(0.01 * (i+1))
      scene.group.children[i].roty(0.02).rotx(0.015)
    outside.roty(0.02).rotx(0.015)
    inside.roty(-0.01).rotx(-0.02)
    faroutside.roty(0.02).rotz(0.02)
    around.roty(0.01)

  return scene

seen.demoSimpleScene = () ->
  scene = seen.emptyScene()

  # shapes!
  scene.group.add(seen.Shapes.unitcube().scale(30))
  scene.group.add(seen.Shapes.tetrahedron().scale(10).translate(50,50))
  scene.group.add(seen.Shapes.tetrahedron().scale(10).roty(0.5 * Math.PI).translate(-50,30))
  scene.group.eachShape randomColors

  return scene

randomColors = (shape) ->
  hue = Math.random()
  for surface in shape.surfaces
    surface.fill = new seen.Colors.fromHsl(hue, 0.5, 0.4)


seen.demoSkeletonScene = () ->
  scene = seen.emptyScene()

  skeleton = seen.Shapes.bipedSkeleton()
  skeleton.root.eachShape randomColors
  scene.group = skeleton.root

  scene.group
    .scale(10)
    .translate(0,20,-150)

  
  i = 0
  scene.on 'beforeRender.animate', () ->
    for g, gi in [skeleton.leftShoulder, skeleton.rightShoulder]
      g.reset().rotz(0.3 * Math.sin(i*0.05))

    for g, gi in [skeleton.leftArm.elbow]
      g.reset().rotx(-1 - 0.3 * Math.cos(i*0.05))

    i++

  return scene


seen.demoArticulationScene2 = () ->
  scene = seen.emptyScene()

  # Shape tree
  joints = seen.Shapes.joints(5)
  root = joints[0]
  root.scale(20)
  
  root.eachShape randomColors

  scene.group = root

  i = 0
  renderLoop = () ->
    for j, ji in joints
      j.reset().rotx(0.1 * Math.sin(i*0.1)) unless ji == 0
    root.roty(0.02).rotx(0.015)
    scene.render()
    i++

  setInterval(renderLoop, 30)

  return scene

seen.demoArticulationScene = () ->
  scene = seen.emptyScene()

  size = 5

  # Shape tree
  root = new seen.Group().add(seen.Shapes.unitcube().scale(size))
  lastg = root
  joints = []
  for i in [0...20]
    nextg = lastg.append()
      .translate(0,size)
      .append()
        .add(seen.Shapes.unitcube().scale(size))
    joints.push nextg
    lastg = nextg
  
  root.eachShape randomColors

  scene.group = root

  i = 0
  renderLoop = () ->
    for g in joints
      g.reset().rotz(0.02 * Math.sin(i*0.05))
    root.roty(0.02).rotx(0.015)
    scene.render()
    i++

  setInterval(renderLoop, 30)

  return scene

seen.demoJSONScene = () ->
  scene = seen.emptyScene()

  s = {
    type: 'tetrahedron'
    transforms: [
      ['scale', 30]
    ]
  }

  shape = seen.Shapes.fromJSON(s)
  #shape = seen.Shapes.fromJSON(shape.toJSON())
  #console.debug shape.toJSON()
  scene.group.add shape

  for shape in scene.group.children
    hue = Math.random()
    for surface in shape.surfaces
      surface.fill = new seen.Colors.fromHsl(hue, 0.5, 0.4)

  renderLoop = () ->
      #for shape in scene.shapes
      #  shape.roty(0.005).rotx(0.002)
      scene.render()
  setInterval(renderLoop, 30)

  return scene


