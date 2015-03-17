# ## SVG Context
# ------------------

# Creates a new SVG element in the SVG namespace.
_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

class seen.SvgStyler
  _attributes : {}
  _svgTag     : 'g'

  constructor : (@elementFactory) ->

  clear : () ->
    @_attributes = {}
    return @

  fill : (style = {}) ->
    @_paint(style)
    return @

  draw : (style = {}) ->
    @_paint(style)
    return @

  _paint : (style) ->
    el = @elementFactory(@_svgTag)

    str = ''
    for key, value of style
      str += "#{key}:#{value};"
    el.setAttribute('style', str)

    for key, value of @_attributes
      el.setAttribute(key, value)
    return el

class seen.SvgPathPainter extends seen.SvgStyler
  _svgTag : 'path'

  path : (points) ->
    @_attributes.d = 'M' + points.map((p) -> "#{p.x} #{p.y}").join 'L'
    return @

class seen.SvgTextPainter
  _svgTag      : 'text'

  constructor : (@elementFactory) ->

  fillText : (m, text, style = {}) ->
    el = @elementFactory(@_svgTag)
    el.setAttribute('transform', "matrix(#{m[0]} #{m[3]} #{-m[1]} #{-m[4]} #{m[2]} #{m[5]})")

    str = ''
    for key, value of style
      if value? then str += "#{key}:#{value};"
    el.setAttribute('style', str)

    el.textContent = text


class seen.SvgRectPainter extends seen.SvgStyler
  _svgTag : 'rect'

  rect : (width, height) ->
    @_attributes.width  = width
    @_attributes.height = height
    return @

class seen.SvgCirclePainter extends seen.SvgStyler
  _svgTag : 'circle'

  circle: (center, radius) ->
    @_attributes.cx = center.x
    @_attributes.cy = center.y
    @_attributes.r  = radius
    return @

class seen.SvgLayerRenderContext extends seen.RenderLayerContext
  constructor : (@group) ->
    @pathPainter   = new seen.SvgPathPainter(@_elementFactory)
    @textPainter   = new seen.SvgTextPainter(@_elementFactory)
    @circlePainter = new seen.SvgCirclePainter(@_elementFactory)
    @rectPainter   = new seen.SvgRectPainter(@_elementFactory)
    @_i = 0

  path   : () -> @pathPainter.clear()
  rect   : () -> @rectPainter.clear()
  circle : () -> @circlePainter.clear()
  text   : () -> @textPainter

  reset : ->
    @_i = 0

  cleanup : ->
    children = @group.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  # Returns an element with tagname `type`.
  #
  # This method uses an internal iterator to add new elements as they are
  # drawn. If there is no child element at the current index, we append one
  # and return it. If an element exists at the current index and it is the
  # same type, we return that. If the element is a different type, we create
  # one and replace it then return it.
  _elementFactory : (type) =>
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

  layer : (layer) ->
    @svg.appendChild(group = _svg('g'))
    @layers.push {
      layer   : layer
      context : new seen.SvgLayerRenderContext(group)
    }
    return @

seen.SvgContext = (elementId, scene) ->
  context = new seen.SvgRenderContext(elementId)
  if scene? then context.sceneLayer(scene)
  return context
