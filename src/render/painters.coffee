
# ## Painters
# ------------------

class seen.Painter
  paint : (renderObject, context) ->
    # Override this

class PathPainter extends seen.Painter
  paint : (renderObject, context) ->
    context.path()
      .style(
        fill           : if not renderObject.fill? then 'none' else renderObject.fill.hex()
        stroke         : if not renderObject.stroke? then 'none' else renderObject.stroke.hex()
        'fill-opacity' : if not renderObject.fill?.a? then 1.0 else (renderObject.fill.a / 255.0)
        'stroke-width' : renderObject.surface['stroke-width'] ? 1
      ).path(renderObject.projected.points)

class TextPainter extends seen.Painter
  paint : (renderObject, context) ->
    context.text()
      .style(
        fill          : if not renderObject.fill? then 'none' else renderObject.fill.hex()
        stroke        : if not renderObject.stroke? then 'none' else renderObject.stroke.hex()
        'text-anchor' : renderObject.surface.anchor ? 'middle'
      )
      .transform(renderObject.transform.copy().multiply renderObject.projection)
      .text(renderObject.surface.text)

seen.Painters = {
  path : new PathPainter()
  text : new TextPainter()
}
