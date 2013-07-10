
_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

_line = d3.svg.line()
  .x((d) -> d.x)
  .y((d) -> d.y)

class seen.Renderer
  render: (surfaces) ->
    @reset()
    for surface in surfaces
      surface.painter.paint(surface, @)
    @hideUnused()

  path : ->
    # override should return a path renderer

  text : ->
    # override should return a text renderer

class seen.SvgRenderer extends seen.Renderer
  constructor : () ->
    @_i = 0

  addTo : (layer) ->
    @_g = layer

  path : () ->
    el = @_manifest('path')
    return {
      el    : el
      path  : (points) ->
        el.setAttribute('d', _line(points))
        return @
      style : (style) ->
        str = ''
        for key,val of style
          str += "#{key}:#{val};"
        el.setAttribute('style', str)
        return @
    }

  text : () ->
    el = @_manifest('text')
    el.setAttribute 'font-family', 'Roboto'
    return {
      el        : el
      text      : (text) ->
        el.textContent = text
        return @
      style     : (style) ->
        str = ''
        for key,val of style
          str += "#{key}:#{val};"
        el.setAttribute('style', str)
        return @
      transform : (transform) ->
        m = transform.m
        el.setAttribute('transform', "matrix(#{m[0]} #{m[4]} #{m[1]} #{m[5]} #{m[3]} #{m[7]})")
        return @
    }

  reset : ->
    @_i = 0

  hideUnused : ->
    children = @_g.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  _manifest : (type) ->
    children = @_g.childNodes
    if @_i >= children.length
      path = _svg(type)
      @_g.appendChild(path)
      @_i++
      return path

    current = children[@_i]
    if current.tagName is type
      @_i++
      return current
    else
      path = _svg(type)
      @_g.replaceChild(path, current)
      @_i++
      return path

class seen.SvgCanvas
  constructor: (@svg) ->
    @layers = {}

  layer : (name, component) ->
    layer = @layers[name] = _svg('g')
    @svg.appendChild(layer)
    if component?
      component.addTo layer
    return @

class seen.SvgRenderDebug
  constructor: (scene) ->
    @_text = _svg('text')
    @_text.setAttribute('style', 'text-anchor:end;')
    @_text.setAttribute('x', 500 - 10)
    @_text.setAttribute('y', '20')

    @_fps = 30
    scene.on 'beforeRender.debug', @_renderStart
    scene.on 'afterRender.debug', @_renderEnd

  addTo: (layer) ->
    layer.appendChild(@_text)

  _renderStart: =>
    @_renderStartTime = new Date()

  _renderEnd: (e) =>
    frameTime = 1000 / (new Date() - @_renderStartTime)
    if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
    @_text.textContent = "fps: #{@_fps.toFixed(1)} surfaces: #{e.surfaces.length}"

class seen.SvgFillRect
  addTo: (layer) ->
    rect = _svg('rect')
    rect.setAttribute('fill', '#EEE')
    rect.setAttribute('width', 500)
    rect.setAttribute('height', 500)
    layer.appendChild(rect)
