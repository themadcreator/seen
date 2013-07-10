# ## The Scene
# ------------------

class seen.Scene
  defaults:
    cullBackfaces : true
    projection    : seen.Projections.perspective(-100, 100, -100, 100, 100, 300)
    viewport      : seen.Viewports.centerOrigin(500, 500)

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)

    @dispatch = d3.dispatch('beforeRender', 'afterRender')
    d3.rebind(@, @dispatch, ['on'])

    @group  = new seen.Group()
    @shader = seen.Shaders.phong
    @lights =
      points   : []
      ambients : []
    @surfaces = []
    @renderModelCache = {}

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)

  render: () =>
    @dispatch.beforeRender()
    surfaces = @_renderSurfaces()
    @renderer.render(surfaces)
    @dispatch.afterRender(surfaces : surfaces)
    return @
 
  _renderSurfaces: () =>
    # compute projection matrix
    projection = @projection.multiply(@viewport)

    # precompute light data
    for key, lights of @lights
      for light in lights
        light.render()

    # clear renderable surfaces array
    @surfaces.length = 0
    @group.eachTransformedShape (shape, transform) =>
      for surface in shape.surfaces
        # compute transformed and projected geometry
        render = surface.render = @_renderSurface(surface, transform, projection)

        # test for culling
        if (not @cullBackfaces or not surface.cullBackfaces or render.projected.normal.z < 0)
          # apply material shading
          render.fill   = surface.fill?.render(@lights, @shader, render.transformed)
          render.stroke = surface.stroke?.render(@lights, @shader, render.transformed)

          # add surface to renderable surfaces array
          @surfaces.push(surface)

    # sort for painter's algorithm
    @surfaces.sort (a, b) ->
      return  b.render.projected.barycenter.z - a.render.projected.barycenter.z

    return @surfaces

  _renderSurface : (surface, transform, projection) ->
    renderModel = @renderModelCache[surface.id]
    if not renderModel?
      renderModel = @renderModelCache[surface.id] = new seen.RenderSurface(surface.points, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

