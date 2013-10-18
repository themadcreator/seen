
# ## Painters
# ------------------

class seen.Painter
  paint : (renderObject, canvas) ->
    # Override this

class PathPainter extends seen.Painter
  paint : (renderObject, canvas) ->
    canvas.path()
      .path(renderObject.renderModel.projected.points)
      .style(
        fill           : if not renderObject.renderModel.fill? then 'none' else renderObject.renderModel.fill.hex()
        stroke         : if not renderObject.renderModel.stroke? then 'none' else renderObject.renderModel.stroke.hex()
        'fill-opacity' : if not renderObject.surface.fill?.a? then 1.0 else (renderObject.surface.fill.a / 255.0)
        'stroke-width' : renderObject.surface['stroke-width'] ? 1
      )

class TextPainter extends seen.Painter
  paint : (surface, canvas) ->
    canvas.text()
      .text(renderObject.surface.text)
      .transform(renderObject.renderModel.transform.multiply renderObject.renderModel.projection)
      .style(
        fill          : if not renderObject.renderModel.fill? then 'none' else renderObject.renderModel.fill.hex()
        stroke        : if not renderObject.renderModel.stroke? then 'none' else renderObject.renderModel.stroke.hex()
        'text-anchor' : renderObject.surface.anchor ? 'middle'
      )

seen.Painters = {
  path : new PathPainter()
  text : new TextPainter()
}
