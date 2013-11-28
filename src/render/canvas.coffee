
class seen.CanvasPathPainter
  constructor : (@ctx) ->

  style: (style) ->
    for key, val of style
      switch key
        when 'fill' then @ctx.fillStyle = val
        when 'stroke' then @ctx.strokeStyle = val
    return @

  path: (points) ->
    @ctx.beginPath()

    for p, i in points
      if i is 0
        @ctx.moveTo(p.x, p.y)
      else
        @ctx.lineTo(p.x, p.y)

    @ctx.closePath()
    @ctx.fill()
    return @


class seen.CanvasTextPainter
  constructor : (@ctx) ->

  style: (style) ->
    for key, val of style
      switch key
        when 'fill' then @ctx.fillStyle = val
        when 'stroke' then @ctx.strokeStyle = val

    @ctx.font = '16px Roboto'
    return @

  text: (text) ->
    @ctx.fillText(text, 0, 0)
    @ctx.setTransform(1, 0, 0, 1, 0, 0)
    return @

  transform: (transform) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @ctx.setTransform(m[0], m[4], m[1], m[5], m[3], m[7])
    return @


class seen.CanvasRectPainter
  constructor : (@ctx) ->

  style: (style) ->
    for key, val of style
      switch key
        when 'fill' then @ctx.fillStyle = val
        when 'stroke' then @ctx.strokeStyle = val
    return @

  size: ({width, height}) ->
    @ctx.fillRect(0, 0, width, height)
    return @


class seen.CanvasLayerRenderContext extends seen.RenderLayerContext
  constructor : (@ctx) ->
    @pathPainter = new seen.CanvasPathPainter(@ctx)
    @textPainter = new seen.CanvasTextPainter(@ctx)
    @rectPainter = new seen.CanvasRectPainter(@ctx)

  path : () ->
    return @pathPainter

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

