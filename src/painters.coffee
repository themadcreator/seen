
# ## Painters
# ------------------

class seen.Painter
  paint : (surface, canvas) ->
    # Override this

class PathPainter extends seen.Painter
  paint : (surface, canvas) ->
    render = surface.render
    canvas.path()
      .path(render.projected.points)
      .style(
        fill           : if not render.fill? then 'none' else render.fill.hex()
        stroke         : if not render.stroke? then 'none' else render.stroke.hex()
        'fill-opacity' : if not surface.fill? then 1.0 else (surface.fill.a / 0xFF)
        'stroke-width' : surface['stroke-width'] ? 1
      )

class TextPainter extends seen.Painter
  paint : (surface, canvas) ->
    render = surface.render
    canvas.text()
      .text(surface.text)
      .transform(render.transform.multiply render.projection)
      .style(
        fill          : if not render.fill? then 'none' else render.fill.hex()
        stroke        : if not render.stroke? then 'none' else render.stroke.hex()
        'text-anchor' : surface.anchor ? 'middle'
      )

seen.Painters = {
  path : new PathPainter()
  text : new TextPainter()
}
