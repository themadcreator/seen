# ## The Scene
# ------------------

class seen.Scene
  defaults:
    cullBackfaces : true
    camera        : new seen.Camera()
    model         : new seen.Model()
    shader        : seen.Shaders.phong

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)

    @dispatch = d3.dispatch('beforeRender', 'afterRender', 'render')
    d3.rebind(@, @dispatch, ['on'])

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
    projection = @camera.getMatrix()

    # build renderable surfaces array
    surfaces = []
    @model.eachTransformedShape (shape, lights, transform) =>
      # precompute light data. TODO, reduce re-computation
      for light in lights
        light.render()
      lights = seen.Lights.toHash(lights)

      for surface in shape.surfaces
        # compute transformed and projected geometry
        renderModel = @_renderSurface(surface, transform, projection)

        # test for culling
        if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0)
          # apply material shading
          renderModel.fill   = surface.fill?.render(lights, @shader, renderModel.transformed)
          renderModel.stroke = surface.stroke?.render(lights, @shader, renderModel.transformed)

          # add surface to renderable surfaces array
          surfaces.push
            renderModel : renderModel
            surface     : surface

    # sort for painter's algorithm
    surfaces.sort (a, b) ->
      return  b.renderModel.projected.barycenter.z - a.renderModel.projected.barycenter.z

    return surfaces

  _renderSurface : (surface, transform, projection) ->
    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface.points, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

