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

    @dispatch = seen.Events.dispatch('beforeRender', 'afterRender', 'render')
    @on       = @dispatch.on
    @_renderModelCache = {}

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)

  render: () =>
    @dispatch.beforeRender()
    renderModels = @_renderSurfaces()
    @dispatch.render(renderModels)
    @dispatch.afterRender(renderModels)
    return @

  _renderSurfaces: () =>
    # compute projection matrix
    projection = @camera.getMatrix()

    # build renderable surfaces array
    renderModels = []

    @model.eachRenderable(
      (light, transform) ->
        # precompute light data.
        new seen.LightRenderModel(light, transform)

      (shape, lights, transform) =>
        for surface in shape.surfaces
          # compute transformed and projected geometry
          renderModel = @_renderSurface(surface, transform, projection)

          # test for culling
          if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0)
            # apply material shading
            renderModel.fill   = surface.fill?.render(lights, @shader, renderModel.transformed)
            renderModel.stroke = surface.stroke?.render(lights, @shader, renderModel.transformed)

            # add surface to renderable surfaces array
            renderModels.push renderModel
    )

    # sort for painter's algorithm
    renderModels.sort (a, b) ->
      return  b.projected.barycenter.z - a.projected.barycenter.z

    return renderModels


  _renderSurface : (surface, transform, projection) ->
    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

