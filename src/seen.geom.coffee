
###
Once initialized, this class will have a constant memory footprint
down to number primitives. Also, we compare each transform and projection
to prevent unnecessary re-computation.
###
class seen.RenderSurface
  constructor: (@points, @transform, @projection) ->
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection) ->
    if @_arraysEqual(transform.m, @transform.m) and @_arraysEqual(projection.m, @projection.m)
      return
    else
      @transform = transform
      @projection = projection
      @_update()

  _update: () ->
    @_math(@transformed, @points, @transform, false)
    @_math(@projected, @transformed.points, @projection, true)

  _arraysEqual: (a, b) ->
    if not a.length == b.length then return false
    for val, i in a
      if not (val == b[i]) then return false
    return true

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
      if applyClip then sp._divide(sp.w)

    # Compute barycenter
    set.barycenter.set(seen.Points.ZERO)
    for p in set.points
      set.barycenter._add(p)
    set.barycenter._divide(set.points.length)

    # Compute normal
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
