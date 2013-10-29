
class seen.Model extends seen.Transformable
  constructor: () ->
    super()
    @children = []
    @lights = []

  add: (child) ->
    @children.push child
    return @

  append: () ->
    group = new seen.Model
    @add group
    return group

  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Model
        child.eachShape(f)

  eachRenderable : (lightFn, shapeFn) ->
    @_eachRenderable(lightFn, shapeFn, [], @m)

  _eachRenderable : (lightFn, shapeFn, lightModels, transform) ->
    if @lights.length > 0 then lightModels = lightModels.slice()
    for light in @lights
      lightModels.push lightFn.call(@, light, light.m.copy().multiply(transform))

    for child in @children
      if child instanceof seen.Shape
        shapeFn.call(@, child, lightModels, child.m.copy().multiply(transform))
      if child instanceof seen.Model
        child._eachRenderable(lightFn, shapeFn, lightModels, child.m.copy().multiply(transform))


seen.Models = {
  default : ->
    model = new seen.Model()

    # Key
    model.lights.push seen.Lights.directional
      normal    : seen.P(-1, 1, 1).normalize()
      color     : seen.Colors.hsl(0.1, 0.4, 0.7)
      intensity : 0.004

    # Back
    model.lights.push seen.Lights.directional
      normal    : seen.P(1, 1, -1).normalize()
      intensity : 0.003

    # Fill
    model.lights.push seen.Lights.ambient
      intensity : 0.0015

    return model
}
