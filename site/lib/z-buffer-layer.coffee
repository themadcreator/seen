class CanvasBuffer
  @create: -> new CanvasBuffer(document.createElement('canvas'))

  constructor: (@canvas) ->
    @context = new seen.CanvasLayerRenderContext(@ctx = @canvas.getContext('2d'))

  clear: (color, boundsArgsArray) ->
    boundsArgsArray ?= [0, 0, @canvas.width, @canvas.height]
    if color?
      @context.ctx.fillStyle = color
      @context.ctx.fillRect.apply(@context.ctx, boundsArgsArray)
    else
      @context.ctx.clearRect.apply(@context.ctx, boundsArgsArray)

  matchSize: (canvas) ->
    @canvas.width = canvas.clientWidth
    @canvas.height = canvas.clientHeight

  copyTo: (ctx, boundsArgsArray) ->
    boundsArgsArray ?= [0, 0, @canvas.width, @canvas.height]
    ctx.drawImage.apply(ctx, [@canvas].concat(boundsArgsArray).concat(boundsArgsArray))

class seen.ZBufferedCanvasLayer extends seen.RenderLayer
  constructor : (@scene, @outputDebugZBuffer = false) ->
    @zBuffer = CanvasBuffer.create()
    @colorBuffer = CanvasBuffer.create()
    @zComposite = CanvasBuffer.create()
    @zCompositeCmp = CanvasBuffer.create()

  render : (context) =>
    # reset zComposite
    @zComposite.matchSize(context.ctx.canvas)
    @zComposite.clear("black")
    @zCompositeCmp.matchSize(context.ctx.canvas)

    # use reverse painter's order to optimize occlusion
    renderModels = @scene.render()
    renderModels.reverse()
    for renderModel in renderModels
      @paint(renderModel.surface.painter, renderModel, context)

  paint : (delegate, renderModel, context) ->
    bounds = @getFragmentBounds(renderModel)
    if bounds.w is 0 or bounds.h is 0 then return

    @resetBuffers(context, bounds)

    # paint z-buffer using depth gradient
    fill = @getZGradient(renderModel, @zBuffer.context.ctx)
    @zBuffer.context.path().path(renderModel.projected.points).fill({ fill })

    # paint color buffer
    delegate.paint(renderModel, @colorBuffer.context)

    # composite color using z-buffer
    @composite(context, bounds)

  getFragmentBounds: (renderModel) ->
    b = renderModel.projected.bounds
    bounds = {
      x : Math.floor(b.minX())
      y : Math.floor(b.minY())
      w : Math.ceil(b.width())
      h : Math.ceil(b.height())
    }
    bounds.args = [bounds.x, bounds.y, bounds.w, bounds.h]
    return bounds

  resetBuffers: (context, bounds) ->
    @colorBuffer.matchSize(context.ctx.canvas)
    @colorBuffer.clear(null, bounds.args)

    @zBuffer.matchSize(context.ctx.canvas)
    @zBuffer.clear("black", bounds.args)

  zToColor : (pz) ->
    h = @zComposite.canvas.height
    z = (h / 2 - pz) / h
    if z <= 0 then return "black" # "green"
    if z >= 1 then return "white" # "red"
    z = Math.floor(z * 255)
    return "rgb(#{z}, #{z}, #{z})"

  getZGradient: (renderModel, ctx) ->
    # if plane is flat toward camera, just use single z-coordinate
    # to avoid numerical errors
    if Math.abs(renderModel.projected.normal.z) > 0.99
      return @zToColor(renderModel.projected.barycenter.z)

    to2d = (p) -> seen.P(p.x, p.y)
    points = renderModel.projected.points.map to2d
    normal = to2d(renderModel.projected.normal).normalize()
    center = to2d(renderModel.projected.barycenter)

    # compute gradient slopts
    slopes = renderModel.projected.points.map((p) ->
      gradientDot = to2d(renderModel.projected.points[0]).subtract(center).dot(normal)
      if (Math.abs(gradientDot) < 1e-3) then return null
      gradientSlope = (renderModel.projected.points[0].z - renderModel.projected.barycenter.z) / gradientDot
      return {gradientDot, gradientSlope}
    ).filter((p) -> p?)

    # choose best one
    slopes.sort((a, b) -> Math.abs(b.gradientDot) - Math.abs(a.gradientDot))
    if slopes.length is 0 then return null
    slope = slopes[0].gradientSlope

    getPointAtZ = (z) ->
      dz = z - renderModel.projected.barycenter.z
      return normal.copy().multiply(dz / slope).add(center)

    whitePoint = getPointAtZ(0)
    blackPoint = getPointAtZ(400)

    # console.log 'white', whitePoint, 'black', blackPoint

    gradient = ctx.createLinearGradient(blackPoint.x, blackPoint.y, whitePoint.x, whitePoint.y)
    gradient.addColorStop(0, "black")
    gradient.addColorStop(0.996, "white") # any closer to 1.0 will break
    gradient.addColorStop(1, "black")
    return gradient

  # This composite method was inspired by this reddit post by the user Agumander:
  # https://www.reddit.com/r/gamedev/comments/35v3lw/zbuffering_in_html5_canvas_without_iterating_over/
  #
  # Previously, this was implemented by iterating over the pixel image data,
  # but that was way too slow to be interactive. This method technically does
  # more calculation, but it uses the browser's native composite operations,
  # which are highly optimized and fast.
  composite: (colorComposite, bounds) ->
    # store previous z-buffer
    @zCompositeCmp.ctx.globalCompositeOperation = 'copy'
    @zComposite.copyTo(@zCompositeCmp.ctx, bounds.args)
    # use lighten to update z-buffer
    @zCompositeCmp.ctx.globalCompositeOperation = 'lighten'
    @zBuffer.copyTo(@zCompositeCmp.ctx, bounds.args)
    # use difference to find unoccluded parts of fragment
    @zCompositeCmp.ctx.globalCompositeOperation = 'difference'
    @zComposite.copyTo(@zCompositeCmp.ctx, bounds.args)
    # update composite z buffer
    @zComposite.ctx.globalCompositeOperation = 'lighten'
    @zBuffer.copyTo(@zComposite.ctx, bounds.args)

    if @outputDebugZBuffer
      colorComposite.ctx.globalCompositeOperation = 'lighten'
      @zComposite.copyTo(colorComposite.ctx, bounds.args)
      return

    # create mask of unoccluded parts
    @zCompositeCmp.ctx.globalCompositeOperation = 'color-dodge'
    @zCompositeCmp.clear('white', bounds.args)
    # apply mask to color buffer
    @colorBuffer.ctx.globalCompositeOperation = 'multiply'
    @zCompositeCmp.copyTo(@colorBuffer.ctx, bounds.args)
    # invert mask and apply to color composite
    @zCompositeCmp.ctx.globalCompositeOperation = 'difference'
    @zCompositeCmp.clear('white', bounds.args)
    colorComposite.ctx.globalCompositeOperation = 'darken'
    @zCompositeCmp.copyTo(colorComposite.ctx, bounds.args)
    # finally, add masked color buffer to color composite
    colorComposite.ctx.globalCompositeOperation = 'lighten'
    @colorBuffer.copyTo(colorComposite.ctx, bounds.args)
