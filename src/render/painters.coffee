
# ## Painters
# #### Surface painters
# ------------------

# Each `Painter` overrides the paint method. It uses the supplied
# `RenderLayerContext`'s builders to create and style the geometry on screen.
class seen.Painter
  paint : (renderModel, context) ->

class seen.PathPainter extends seen.Painter
  paint : (renderModel, context) ->
    painter = context.path().path(renderModel.projected.points)

    if renderModel.fill?
      painter.fill(
        fill           : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        'fill-opacity' : if not renderModel.fill?.a? then 1.0 else (renderModel.fill.a / 255.0)
      )

    if renderModel.stroke?
      painter.draw(
        fill           : 'none'
        stroke         : if not renderModel.stroke? then 'none' else renderModel.stroke.hex()
        'stroke-width' : renderModel.surface['stroke-width'] ? 1
      )

class seen.TextPainter extends seen.Painter
  paint : (renderModel, context) ->
    style = {
      fill          : if not renderModel.fill? then 'none' else renderModel.fill.hex()
      font          : renderModel.surface.font
      'text-anchor' : renderModel.surface.anchor ? 'middle'
    }
    xform = seen.Affine.solveForAffineTransform(renderModel.projected.points)
    context.text().fillText(xform, renderModel.surface.text, style)

seen.Painters = {
  path : new seen.PathPainter()
  text : new seen.TextPainter()
}
