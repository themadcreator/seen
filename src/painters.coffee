
# ## Painters
# ------------------

class seen.Painter
  paint : (renderObject, canvas) ->
    # Override this

class PathPainter extends seen.Painter
  paint : (renderObject, canvas) ->
    canvas.path()
      .path(renderObject.projected.points)
      .style(
        fill           : if not renderObject.fill? then 'none' else renderObject.fill.hex()
        stroke         : if not renderObject.stroke? then 'none' else renderObject.stroke.hex()
        'fill-opacity' : if not renderObject.surface.fill?.a? then 1.0 else (renderObject.surface.fill.a / 255.0)
        'stroke-width' : renderObject.surface['stroke-width'] ? 1
      )

class TextPainter extends seen.Painter
  paint : (renderObject, canvas) ->
    canvas.text()
      .text(renderObject.surface.text)
      .transform(renderObject.transform.multiply renderObject.projection)
      .style(
        fill          : if not renderObject.fill? then 'none' else renderObject.fill.hex()
        stroke        : if not renderObject.stroke? then 'none' else renderObject.stroke.hex()
        'text-anchor' : renderObject.surface.anchor ? 'middle'
      )

seen.Painters = {
  path : new PathPainter()
  text : new TextPainter()
}
