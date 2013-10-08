# ## The Scene
# ------------------

class seen.Scene
  defaults:
    cullBackfaces : true
    projection    : seen.Viewports.alignCenter(seen.Projections.perspective())

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)

    @dispatch = d3.dispatch('beforeRender', 'afterRender', 'render')
    d3.rebind(@, @dispatch, ['on'])

    @group  = new seen.Group()
    @shader = seen.Shaders.phong
    @lights =
      points       : []
      directionals : []
      ambients     : []
    @surfaces = []
    @_renderModelCache = {}

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)

  render: () =>
    @dispatch.beforeRender()
    renderObjects = @_renderSurfaces()
    @dispatch.render(renderObjects)
    @dispatch.afterRender(renderObjects)
    return @

  _renderSurfaces: () =>
    # compute projection matrix
    projection = @projection # @camera.projection.multiply(@camera.viewport)

    # precompute light data
    for key, lights of @lights
      for light in lights
        light.render()

    # clear renderable surfaces array
    @surfaces.length = 0
    @group.eachTransformedShape (shape, transform) =>
      for surface in shape.surfaces
        # compute transformed and projected geometry
        renderModel = @_renderSurface(surface, transform, projection)

        # test for culling
        if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0)
          # apply material shading
          renderModel.fill   = surface.fill?.render(@lights, @shader, renderModel.transformed)
          renderModel.stroke = surface.stroke?.render(@lights, @shader, renderModel.transformed)

          # add surface to renderable surfaces array
          @surfaces.push
            renderModel : renderModel
            surface     : surface

    # sort for painter's algorithm
    @surfaces.sort (a, b) ->
      return  b.renderModel.projected.barycenter.z - a.renderModel.projected.barycenter.z

    return @surfaces

  _renderSurface : (surface, transform, projection) ->
    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface.points, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

