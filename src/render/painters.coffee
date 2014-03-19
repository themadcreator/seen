
# ## Painters
# #### Defines the methods of painting a surface.
# ------------------

# Each `Painter` overrides the paint method. It uses the supplied `RenderLayerContext`'s builders
# to create and style the geometry on screen.
class seen.Painter
  paint : (renderModel, context) ->

class PathPainter extends seen.Painter
  paint : (renderModel, context) ->
    context.path()
      .style(
        fill           : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        stroke         : if not renderModel.stroke? then 'none' else renderModel.stroke.hex()
        'fill-opacity' : if not renderModel.fill?.a? then 1.0 else (renderModel.fill.a / 255.0)
        'stroke-width' : renderModel.surface['stroke-width'] ? 1
      )
      .path(renderModel.projected.points)
      .fill()

class TextPainter extends seen.Painter
  paint : (renderModel, context) ->
    xform = renderModel.transform.copy().multiply renderModel.projection
    context.text()
      .style(
        fill          : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        'text-anchor' : renderModel.surface.anchor ? 'middle'
      )
      .text(xform, renderModel.surface.text)

seen.Painters = {
  path  : new PathPainter()
  text  : new TextPainter()
}
