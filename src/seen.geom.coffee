
# ## Geometry
# #### Groups, shapes, surfaces, and render data
# ***


# The `RenderSurface` object contains the transformed and projected points as well as various data
# needed to render scene shapes.
#
# Once initialized, the object will have a constant memory footprint
# down to `Number` primitives. Also, we compare each transform and projection
# to prevent unnecessary re-computation.
class seen.RenderSurface
  constructor: (@points, @transform, @projection) ->
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection) ->
    if seen.Util.arraysEqual(transform.m, @transform.m) and seen.Util.arraysEqual(projection.m, @projection.m)
      return
    else
      @transform = transform
      @projection = projection
      @_update()

  _update: () ->
    @_math(@transformed, @points, @transform, false)
    @_math(@projected, @transformed.points, @projection, true)


  _initRenderData: ->
    return {
      points     : (p.copy() for p in @points)
      barycenter : seen.P()
      normal     : seen.P()
      v0         : seen.P()
      v1         : seen.P()
    }

  _math: (set, points, transform, applyClip = false) ->
    # Apply transform to points
    for p,i in points
      sp = set.points[i]
      sp.set(p).transform(transform)
      # Applying the clip is what ultimately scales the x and y coordinates in a perpsective projection
      if applyClip then sp._divide(sp.w)

    # Compute barycenter, which is used in aligning shapes in the painters algorithm
    set.barycenter.set(seen.Points.ZERO)
    for p in set.points
      set.barycenter._add(p)
    set.barycenter._divide(set.points.length)

    # Compute normal, which is used for backface culling (when enabled)
    set.v0.set(set.points[1])._subtract(set.points[0])
    set.v1.set(set.points[points.length - 1])._subtract(set.points[0])
    set.normal.set(set.v0._cross(set.v1)._normalize())

class seen.Surface
  cullBackfaces : true
  fill          : new seen.Material(seen.C.gray)
  stroke        : null

  constructor: (@points, @painter = seen.Painters.path) ->

  updateRenderData: (transform, projection) =>
    if not @render? 
      @render = new seen.RenderSurface(@points, transform, projection)
    else
      @render.update(transform, projection)
    return @render

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
