# ## Render Contexts
# ------------------

# The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
# Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
class seen.RenderContext
  constructor: ->
    @layers = []

  render: () =>
    @reset()
    for layer in @layers
      layer.context.reset()
      layer.layer.render(layer.context)
      layer.context.cleanup()
    @cleanup()
    return @

  # Returns a new `Animator` with this context's render method pre-registered.
  animate : ->
    return new seen.Animator().onRender(@render)

  # Add a new `RenderLayerContext` to this context. This allows us to easily stack paintable components such as
  # a fill backdrop, or even multiple scenes in one context.
  layer: (layer) ->
    @layers.push {
      layer   : layer
      context : @
    }
    return @ 

  sceneLayer : (scene) ->
    @layer(new seen.SceneLayer(scene))
    return @

  reset   : ->
  cleanup : ->

# The `RenderLayerContext` defines the interface for producing painters that can paint various things into the current layer.
class seen.RenderLayerContext
  path    : -> # Return a path painter
  rect    : -> # Return a rect painter
  circle  : -> # Return a circle painter
  text    : -> # Return a text painter
  
  reset   : ->
  cleanup : ->

# Create a render context for the element with the specified `elementId`. elementId
# should correspond to either an SVG or Canvas element.
seen.Context = (elementId, scene = null) ->
  tag = seen.Util.element(elementId)?.tagName.toUpperCase()
  context = switch tag
    when 'SVG'    then new seen.SvgRenderContext(elementId)
    when 'CANVAS' then new seen.CanvasRenderContext(elementId)
  if context? and scene?
    context.sceneLayer(scene)
  return context