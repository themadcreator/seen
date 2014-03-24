# ## Contexts
# #### Base classes for rendering context and layers
# ------------------

# The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
# Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
class seen.RenderContext
  constructor: ->
    @layers = {}

  render: () =>
    @reset()
    for key, layer of @layers
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
  layer: (name, layer) ->
    @layers[name] = {
      layer   : layer
      context : @
    }
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

seen.Contexts = {
  create : (elementId, width, height) ->
    tag = seen.Util.element(elementId)?.tagName.toUpperCase()
    switch tag
      when 'SVG'    then return new seen.SvgRenderContext(elementId)
      when 'CANVAS' then return new seen.CanvasRenderContext(elementId, width, height)
  
  createWithScene : (elementId, scene, width, height) ->
    context = seen.Contexts.create(elementId, width, height)
    seen.LayersScene(context, scene, width, height)
    return context
}