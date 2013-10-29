
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

class seen.SvgRenderer extends seen.RenderLayer
  constructor : ->
    @pathPainter = new seen.SvgPathPainter()
    @textPainter = new seen.SvgTextPainter()

  setGroup : (@group) ->

  path : () ->
    el = @_manifest('path')
    @pathPainter.setElement el
    return @pathPainter

  text : () ->
    el = @_manifest('text')
    el.setAttribute 'font-family', 'Roboto'
    @textPainter.setElement el
    return @textPainter

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


class seen.SvgRenderDebug extends seen.RenderLayer
  constructor: (scene) ->
    @_text = _svg('text')
    @_text.setAttribute('style', 'text-anchor:end;')
    @_text.setAttribute('x', 500 - 10)
    @_text.setAttribute('y', '20')

    @_fps = 30
    scene.on 'beforeRender.debug', @_renderStart
    scene.on 'afterRender.debug', @_renderEnd

  render : ->

  setGroup: (group) ->
    group.appendChild(@_text)

  _renderStart: =>
    @_renderStartTime = new Date()

  _renderEnd: (e) =>
    frameTime = 1000 / (new Date() - @_renderStartTime)
    if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
    @_text.textContent = "fps: #{@_fps.toFixed(1)} surfaces: #{e.length}"


class seen.SvgFillRect extends seen.RenderLayer
  constructor : (@width = 500, @height = 500) ->

  render : ->

  setGroup: (group) ->
    rect = _svg('rect')
    rect.setAttribute('fill', '#EEE')
    rect.setAttribute('width',  @width)
    rect.setAttribute('height', @width)
    group.appendChild(rect)


class seen.SvgCanvas extends seen.Renderer
  constructor: (scene, @svg) ->
    super(scene)

  layer : (name, component) ->
    @layers[name] = component
    @svg.appendChild(group = _svg('g'))
    component?.setGroup group
    return @

seen.SvgScene = (elementId, scene, width = 400, height = 400) ->
  new seen.SvgCanvas(scene, document.getElementById(elementId))
    .layer('background', new seen.SvgFillRect(width, height))
    .layer('scene', new seen.SvgRenderer())
