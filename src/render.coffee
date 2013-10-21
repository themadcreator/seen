
class seen.Renderer
  constructor: (@scene) ->
    @scene.on "render.renderer-#{seen.Util.uniqueId()}", @render

  render: (renderObjects) =>
    @reset()
    for renderObject in renderObjects
      renderObject.surface.painter.paint(renderObject, @)
    @hideUnused()

  path : ->
    # override should return a path renderer

  text : ->
    # override should return a text renderer


# The `RenderModel` object contains the transformed and projected points as well as various data
# needed to render scene shapes.
#
# Once initialized, the object will have a constant memory footprint
# down to `Number` primitives. Also, we compare each transform and projection
# to prevent unnecessary re-computation.
class seen.RenderModel
  constructor: (@surface, @transform, @projection) ->
    @points      = @surface.points
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection) ->
    if seen.Util.arraysEqual(transform.m, @transform.m) and seen.Util.arraysEqual(projection.m, @projection.m)
      return
    else
      @transform  = transform
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

class seen.LightRenderModel
  constructor: (light, transform) ->
    @colorIntensity = light.color.scale(light.intensity)
    @type           = light.type
    @intensity      = light.intensity
    @point          = light.point.copy().transform(transform)
    origin          = seen.Points.ZERO.copy().transform(transform)
    @normal         = light.normal.copy().transform(transform)._subtract(origin)._normalize()
