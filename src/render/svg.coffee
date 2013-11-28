
_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

_line = (points) ->
  return 'M' + points.map((p) -> "#{p.x} #{p.y}").join 'L'

_styleElement = (el, style) ->
  str = ''
  for key,val of style
    str += "#{key}:#{val};"
  el.setAttribute('style', str)

class seen.SvgPathPainter
  setElement: (@el) ->

  style: (style) ->
    _styleElement(@el, style)
    return @

  path: (points) ->
    @el.setAttribute('d', _line(points))
    return @

class seen.SvgTextPainter
  setElement: (@el) ->

  style: (style) ->
    _styleElement(@el, style)
    return @

  transform: (transform) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @el.setAttribute('transform', "matrix(#{m[0]} #{m[4]} #{m[1]} #{m[5]} #{m[3]} #{m[7]})")
    return @

  text: (text) ->
    @el.textContent = text
    return @

class seen.SvgRectPainter
  setElement: (@el) ->

  style: (style) ->
    _styleElement(@el, style)
    return @

  size: ({width, height}) ->
    @el.setAttribute('width', width)
    @el.setAttribute('height', height)
    return @

class seen.SvgLayerRenderContext extends seen.RenderLayerContext
  constructor : (@group) ->
    @pathPainter = new seen.SvgPathPainter()
    @textPainter = new seen.SvgTextPainter()
    @rectPainter = new seen.SvgRectPainter()
    @_i = 0

  path : () ->
    el = @_manifest('path')
    @pathPainter.setElement el
    return @pathPainter

  text : () ->
    el = @_manifest('text')
    el.setAttribute 'font-family', 'Roboto'
    @textPainter.setElement el
    return @textPainter

  rect : (dims) ->
    el = @_manifest('rect')
    @rectPainter.setElement el
    return @rectPainter

  reset : ->
    @_i = 0

  cleanup : ->
    children = @group.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  _manifest : (type) ->
    children = @group.childNodes
    if @_i >= children.length
      path = _svg(type)
      @group.appendChild(path)
      @_i++
      return path

    current = children[@_i]
    if current.tagName is type
      @_i++
      return current
    else
      path = _svg(type)
      @group.replaceChild(path, current)
      @_i++
      return path

class seen.SvgRenderContext extends seen.RenderContext
  constructor : (@svg) ->
    super()
    @svg = seen.Util.element(@svg)

  layer : (name, layer) ->
    @svg.appendChild(group = _svg('g'))
    @layers[name] = {
      layer   : layer
      context : new seen.SvgLayerRenderContext(group)
    }
    return @

seen.SvgContext = (elementId, scene, width, height) ->
  context = new seen.SvgRenderContext(elementId)
  return seen.LayersScene(context, scene, width, height)
