# ## The Scene
# ------------------

class seen.Scene
  defaults:
    model            : new seen.Model()
    camera           : new seen.Camera()
    shader           : seen.Shaders.phong
    cullBackfaces    : true
    fractionalPoints : false

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)
    @_renderModelCache = {}

  render : () =>
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

            # Rounding the coordinates for display speeds up path drawing at the cost of
            # a slight jittering effect when animating. Anecdotally, the speedup on demo1 was 10 FPS
            if @fractionalPoints isnt true
              p.round() for p in renderModel.projected.points

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

