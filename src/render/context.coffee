
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

  animate : ->
    return new seen.Animator().onRender(@render)

  layer: (name, layer) ->
    @layers[name] = {
      layer   : layer
      context : @
    }
    return @

  reset   : ->
  cleanup : ->


class seen.RenderLayerContext
  path    : -> # Return a path builder
  text    : -> # Return a text builder
  rect    : -> # Return a rect builder

  reset   : ->
  cleanup : ->
