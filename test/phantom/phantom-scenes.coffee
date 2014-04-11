scenes = [

  # ===============================================
  #
  # SHAPES
  #
  # ===============================================

  png    : 'shapes-tetrahedon.png'
  script : ->
    window.test.model.add seen.Shapes.tetrahedron()
      .scale(window.test.height*0.2)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-cube.png'
  script : ->
    window.test.model.add seen.Shapes.cube()
      .scale(window.test.height*0.2)
      .rotz(Math.PI/4)
      .roty(Math.PI/4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-patch.png'
  script : ->
    window.test.model.add seen.Shapes.patch(5, 5)
      .scale(window.test.height*0.1)
      .translate(-window.test.width*0.2,-window.test.height*0.2,0)
      .rotx(-Math.PI/12)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-icosahedron-0.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(0)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-icosahedron-1.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(1)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-icosahedron-2.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-icosahedron-3.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(3)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,
  png    : 'shapes-icosahedron-4.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(4)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
,

  # ===============================================
  #
  # LIGHTS
  #
  # ===============================================

  png    : 'lights-ambient.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.model.lights = [
      seen.Lights.ambient(
        color     : seen.Colors.hex('#0088FF')
        intensity : 0.01
      )
    ]
,
  png    : 'lights-directional.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.model.lights = [
      seen.Lights.directional(
        normal    : seen.P(-1, 1, 1).normalize()
        color     : seen.Colors.hex('#0088FF')
        intensity : 0.01
      )
    ]
,
  png    : 'lights-point.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.model.lights = [
      seen.Lights.point(
        point     : seen.P(-100, 100, 100)
        color     : seen.Colors.hex('#0088FF')
        intensity : 0.01
      )
    ]


  # ===============================================
  #
  # MATERIALS
  #
  # ===============================================

,
  png    : 'materials-stroke.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
      .stroke(new seen.Material seen.Colors.black(), {'stroke-width' : 1}) # TODO this currently doesnt work because its on the surface
,
  png    : 'materials-opacity.png'
  script : ->
    window.test.scene.cullBackfaces = false
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.rgb(255, 136, 0, 80))
,
  png    : 'materials-specular.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'), {specularExponent : 20})
,
  png    : 'materials-metallic.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'), {metallic : true, specularColor : seen.Colors.hex('#0088FF')})
,

  # ===============================================
  #
  # SHADERS
  #
  # ===============================================

  png    : 'shaders-phong.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.scene.shader = seen.Shaders.phong()
,
  png    : 'shaders-diffuse.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.scene.shader = seen.Shaders.diffuse()
,
  png    : 'shaders-ambient.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.scene.shader = seen.Shaders.ambient()
,
  png    : 'shaders-flat.png'
  script : ->
    window.test.model.add seen.Shapes.sphere(2)
      .scale(window.test.height*0.4)
      .fill(new seen.Material seen.Colors.hex('#FF8800'))
    window.test.scene.shader = seen.Shaders.flat()


# SVG vs. Canvas

# Painters
]

module.exports = scenes
