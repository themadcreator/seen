class seen.CanvasStyler
  constructor : (@ctx) ->

  draw : (style = {}) ->
    # Copy over SVG CSS attributes
    if style.stroke? then @ctx.strokeStyle = style.stroke
    if style['stroke-width']? then @ctx.lineWidth = style['stroke-width']
    if style['text-anchor']? then @ctx.textAlign = style['text-anchor']

    @ctx.stroke()
    return @

  fill : (style = {}) ->
    # Copy over SVG CSS attributes
    if style.fill? then @ctx.fillStyle = style.fill
    if style['text-anchor']? then @ctx.textAlign = style['text-anchor']
    if style['fill-opacity'] then @ctx.globalAlpha = style['fill-opacity']

    @ctx.fill()
    return @

class seen.CanvasPathPainter extends seen.CanvasStyler
  path: (points) ->
    @ctx.beginPath()

    for p, i in points
      if i is 0
        @ctx.moveTo(p.x, p.y)
      else
        @ctx.lineTo(p.x, p.y)

    @ctx.closePath()
    return @

class seen.CanvasRectPainter extends seen.CanvasStyler
  rect: (width, height) ->
    @ctx.rect(0, 0, width, height)
    return @

class seen.CanvasCirclePainter extends seen.CanvasStyler
  circle: (center, radius) ->
    @ctx.beginPath()
    @ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, true)
    return @

class seen.CanvasTextPainter
  constructor : (@ctx) ->

  fillText : (transform, text, style = {}) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @ctx.save()
    @ctx.font = '16px Roboto' # TODO method
    @ctx.setTransform(m[0], m[4], m[1], m[5], m[3], m[7])

    if style.fill? then @ctx.fillStyle = style.fill
    if style['text-anchor']? then @ctx.textAlign = style['text-anchor']

    @ctx.fillText(text, 0, 0)
    @ctx.restore()
    return @

class seen.CanvasLayerRenderContext extends seen.RenderLayerContext
  constructor : (@ctx) ->
    @pathPainter  = new seen.CanvasPathPainter(@ctx)
    @ciclePainter = new seen.CanvasCirclePainter(@ctx)
    @textPainter  = new seen.CanvasTextPainter(@ctx)
    @rectPainter  = new seen.CanvasRectPainter(@ctx)
  
  path   : () -> @pathPainter
  rect   : () -> @rectPainter
  circle : () -> @ciclePainter
  text   : () -> @textPainter

class seen.CanvasRenderContext extends seen.RenderContext
  constructor: (@el, @width, @height) ->
    super()
    @el  = seen.Util.element(@el)
    @ctx = @el.getContext('2d')

  layer : (name, layer) ->
    @layers[name] = {
      layer   : layer
      context : new seen.CanvasLayerRenderContext(@ctx)
    }
    return @

  reset : ->
    @ctx.clearRect(0, 0, @width, @height)


seen.CanvasContext = (elementId, scene, width, height) ->
  context = new seen.CanvasRenderContext(elementId, width, height)
  return seen.LayersScene(context, scene, width, height)

