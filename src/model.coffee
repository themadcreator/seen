# The object model class.
# This class stores `Shapes`, `Lights`, and other `Models`
# Since it extends `Transformable` it also contains a transformation matrix.
class seen.Model extends seen.Transformable
  constructor: () ->
    super()
    @children = []
    @lights   = []

  # Add a `Shape`, `Light`, and other `Model` as a child of this `Model`
  # Any number of children can by supplied as arguments.
  add: (childs...) ->
    for child in childs
      if child instanceof seen.Shape or child instanceof seen.Model
        @children.push child
      else if child instanceof seen.Light
        @lights.push child
    return @

  # Remove a shape, model, or light from the model. NOTE: the scene may still
  # contain a renderModel in its cache. If you are adding and removing many items,
  # consider calling `.flush()` on the scene to flush its renderModel cache.
  remove : (childs...) ->
    for child in childs
      while (i = @children.indexOf(child)) >= 0
        @children.splice(i,1)
      while (i = @lights.indexOf(child)) >= 0
        @lights.splice(i,1)

  # Create a new child model and return it.
  append: () ->
    model = new seen.Model
    @add model
    return model

  # Visit each `Shape` in this `Model` and all recursive child `Model`s
  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Model
        child.eachShape(f)

  # Visit each `Light` and `Shape`, accumulating the recursive transformation matrices
  # along the way. The light callback will be called with each light and its accumulated
  # transform and it should return a `LightModel`. Each shape callback with be called
  # with each shape and its accumulated transform as well as the list of light models 
  # that apply to that shape.
  eachRenderable : (lightFn, shapeFn) ->
    @_eachRenderable(lightFn, shapeFn, [], @m)

  _eachRenderable : (lightFn, shapeFn, lightModels, transform) ->
    if @lights.length > 0 then lightModels = lightModels.slice()
    for light in @lights
      continue unless light.enabled
      lightModels.push lightFn.call(@, light, light.m.copy().multiply(transform))

    for child in @children
      if child instanceof seen.Shape
        shapeFn.call(@, child, lightModels, child.m.copy().multiply(transform))
      if child instanceof seen.Model
        child._eachRenderable(lightFn, shapeFn, lightModels, child.m.copy().multiply(transform))


seen.Models = {
  # The default model contains standard Hollywood-style 3-part lighting
  default : ->
    model = new seen.Model()

    # Key light
    model.add seen.Lights.directional
      normal    : seen.P(-1, 1, 1).normalize()
      color     : seen.Colors.hsl(0.1, 0.3, 0.7)
      intensity : 0.004

    # Back light
    model.add seen.Lights.directional
      normal    : seen.P(1, 1, -1).normalize()
      intensity : 0.003

    # Fill light
    model.add seen.Lights.ambient
      intensity : 0.0015

    return model
}
 