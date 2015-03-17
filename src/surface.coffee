# ## Surfaces and Shapes
# ------------------

# A `Surface` is a defined as a planar object in 3D space. These paths don't
# necessarily need to be convex, but they should be non-degenerate. This
# library does not support shapes with holes.
class seen.Surface
  # When 'false' this will override backface culling, which is useful if your
  # material is transparent. See comment in `seen.Scene`.
  cullBackfaces  : true

  # Fill and stroke may be `Material` objects, which define the color and
  # finish of the object and are rendered using the scene's shader.
  fillMaterial   : new seen.Material(seen.C.gray)
  strokeMaterial : null

  constructor : (@points, @painter = seen.Painters.path) ->
    # We store a unique id for every surface so we can look them up quickly
    # with the `renderModel` cache.
    @id = 's' + seen.Util.uniqueId()

  fill : (fill) ->
    @fillMaterial = seen.Material.create(fill)
    return @

  stroke : (stroke) ->
    @strokeMaterial = seen.Material.create(stroke)
    return @

# A `Shape` contains a collection of surface. They may create a closed 3D
# shape, but not necessarily. For example, a cube is a closed shape, but a
# patch is not.
class seen.Shape extends seen.Transformable
  constructor : (@type, @surfaces) ->
    super()

  # Visit each surface
  eachSurface: (f) ->
    @surfaces.forEach(f)
    return @

  # Apply the supplied fill `Material` to each surface
  fill : (fill) ->
    @eachSurface (s) -> s.fill(fill)
    return @

  # Apply the supplied stroke `Material` to each surface
  stroke : (stroke) ->
    @eachSurface (s) -> s.stroke(stroke)
    return @
