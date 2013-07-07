do ->

  _svg = (name) ->
    return $(_svgRaw(name))

  _svgRaw = (name) ->
    return document.createElementNS('http://www.w3.org/2000/svg', name)

  _line = d3.svg.line()
    .x((d) -> d.x)
    .y((d) -> d.y)

  class SvgIterativeRenderer
    constructor : (@g) ->
      @_i = 0
      @_g = @g[0]

    hideUnused : ->
      children = @_g.childNodes
      while (@_i < children.length)
        children[@_i].setAttribute('style', 'display: none;')
        @_i++

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

    _manifest : (type) ->
      children = @_g.childNodes
      if @_i >= children.length
        path = _svgRaw(type)
        @_g.appendChild(path)
        @_i++
        return path

      current = children[@_i]
      if current.tagName is type
        @_i++
        return current
      else
        path = _svgRaw(type)
        @_g.replaceChild(path, current)
        @_i++
        return path

  class seen.SvgCanvas
    width  : 500
    height : 500

    constructor: (@svg) ->
      @layers = 
        background : _svg('g')
          .addClass('background')
          .appendTo(@svg)
        scene : _svg('g')
          .addClass('scene')
          .appendTo(@svg)
        overlay : _svg('g')
          .addClass('overlay')
          .appendTo(@svg)

    add : (component) ->
      component.addTo?(@)
      return @
      
    render : (surfaces) =>
      renderer = new SvgIterativeRenderer(@layers.scene)
      for surface in surfaces
        surface.painter.paint(surface, surface.render, renderer)
      renderer.hideUnused()
      return 


  class seen.SvgRenderDebug
    constructor: (scene) ->
      @_text = _svg('text')
        .css('text-anchor', 'end')
        .attr('y', 20)
      @_fps = 30
      scene.on 'beforeRender.debug', @_renderStart
      scene.on 'afterRender.debug', @_renderEnd

    addTo: (canvas) ->
      @_text
        .attr('x', canvas.width - 10)
        .appendTo(canvas.layers.overlay)

    _renderStart: =>
      @_renderStartTime = new Date()

    _renderEnd: (e) =>
      frameTime = 1000 / (new Date() - @_renderStartTime)
      if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
      @_text.text("fps: #{@_fps.toFixed(1)} surfaces: #{e.surfaces.length}")

  class seen.SvgFillRect
    addTo: (canvas) ->
      _svg('rect')
        .css('fill', '#EEE').attr(
          width  : canvas.width
          height : canvas.height
        ).appendTo(canvas.layers.background)
