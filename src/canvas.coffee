
class seen.CanvasPathPainter
  setContext: (@ctx) ->

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
  setContext: (@ctx) ->

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


class seen.CanvasRenderer extends seen.RenderLayer
  constructor : (@width, @height) ->
    @pathPainter = new seen.CanvasPathPainter()
    @textPainter = new seen.CanvasTextPainter()

  setContext : (@ctx) ->

  path : () ->
    @pathPainter.setContext @ctx
    return @pathPainter

  text : () ->
    @textPainter.setContext @ctx
    return @textPainter


class seen.CanvasFillRect extends seen.RenderLayer
  constructor : (@width = 500, @height = 500) ->

  setContext : (@ctx) ->

  render: =>
    @ctx.fillStyle = '#EEE'
    @ctx.fillRect(0, 0, @width, @height)


class seen.CanvasCanvas extends seen.Renderer
  constructor: (scene, @element) ->
    super(scene)
    @ctx = @element.getContext('2d')

  layer : (name, component) ->
    @layers[name] = component
    component?.setContext @ctx
    return @

  reset : ->
    @ctx.clearRect(0, 0, @width, @height)


seen.CanvasScene = (elementId, scene, width = 400, height = 400) ->
  new seen.CanvasCanvas(scene, document.getElementById(elementId))
    .layer('background', new seen.CanvasFillRect(width, height))
    .layer('scene', new seen.CanvasRenderer(width, height))
