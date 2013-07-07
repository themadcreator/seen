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

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)

  render: () =>
    @dispatch.beforeRender()
    surfaces = @renderSurfaces()
    @canvas.render(surfaces)
    @dispatch.afterRender(surfaces : surfaces)
    return @

  renderSurfaces: () =>
    # compute tranformation matrix
    projection = @projection.multiply(@viewport)

    # project surface geometry and shade
    @surfaces.length = 0
    @group.eachTransformedShape (shape, transform) =>
      for surface in shape.surfaces
        render = surface.getRenderSurface(transform, projection)
        
        if (not @cullBackfaces or not surface.cullBackfaces or render.projected.normal.z < 0) 
          if surface.fill?
            render.fill = @shader.getFaceColor(@lights, render.transformed, surface.fill)

          if surface.stroke?
            render.stroke = surface.stroke

          @surfaces.push(surface)

    # sort for painter's algorithm
    @surfaces.sort (a, b) ->
      return  b.render.projected.barycenter.z - a.render.projected.barycenter.z

    return @surfaces

