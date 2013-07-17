
# ## Geometry
# #### Groups, shapes, and surfaces
# ------------------

# A surface is a defined as a planar object in 3D space. These paths don't necessarily need to be convex.
class seen.Surface
  # When 'false' this will override backface culling, which is useful if your material is transparent
  cullBackfaces : true
  # Fill and stroke may be `Material` objects, which define the color and finish of the object and are rendered using the scene's shader.
  fill          : new seen.Material(seen.C.gray)
  stroke        : null

  # TODO change to options constructor with defaults
  constructor: (@points, @painter = seen.Painters.path) ->
    @id = 's' + seen.Util.uniqueId()

class seen.Shape extends seen.Transformable
  constructor: (@type, @surfaces) ->
    super()

  eachSurface: (f) ->
    @surfaces.forEach(f)
    return @

  fill: (fill) ->
    @eachSurface (s) -> s.fill = fill
    return @

  stroke: (stroke) ->
    @eachSurface (s) -> s.stroke = stroke
    return @

class seen.Group extends seen.Transformable
  constructor: () ->
    super()
    @children = []

  add: (child) ->
    @children.push child
    return @

  append: () ->
    group = new seen.Group
    @add group
    return group

  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Group
        child.eachTransformedShape(f)

  eachTransformedShape: (f, m = null) ->
    m ?= @m
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child, child.m.multiply(m))
      if child instanceof seen.Group
        child.eachTransformedShape(f, child.m.multiply(m))
