class seen.CanvasStyler
  constructor : (@ctx) ->

  style: (style) ->
    for key, val of style
      switch key
        when 'fill' then @ctx.fillStyle = val
        when 'stroke' then @ctx.strokeStyle = val
    return @

  draw : ->
    @ctx.stroke()
    return @

  fill : ->
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
  rect: ({width, height}) ->
    @ctx.rect(0, 0, width, height)
    return @

class seen.CanvasPointPainter extends seen.CanvasStyler
  circle: (point, radius) ->
    @ctx.beginPath()
    @ctx.arc(point.x, point.y, radius, 0, 2*Math.PI, true)
    return @

class seen.CanvasTextPainter extends seen.CanvasStyler
  text: (transform, text) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @ctx.save()
    @ctx.font = '16px Roboto' # TODO method
    @ctx.setTransform(m[0], m[4], m[1], m[5], m[3], m[7])
    @ctx.fillText(text, 0, 0)
    @ctx.restore()
    return @

class seen.CanvasLayerRenderContext extends seen.RenderLayerContext
  constructor : (@ctx) ->
    @pathPainter  = new seen.CanvasPathPainter(@ctx)
    @pointPainter = new seen.CanvasPointPainter(@ctx)
    @textPainter  = new seen.CanvasTextPainter(@ctx)
    @rectPainter  = new seen.CanvasRectPainter(@ctx)

  path : () ->
    return @pathPainter

  point : () ->
    return @pointPainter

  text : () ->
    return @textPainter

  rect : () ->
    return @rectPainter

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

