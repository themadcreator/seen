

class seen.RenderLayer
  render: (context) =>


class seen.FillLayer extends seen.RenderLayer
  constructor : (@width = 500, @height = 500, @fill = '#EEE') ->

  render: (context) =>
    context.rect()
      .style(
        fill : @fill
      )
      .size(
        width  : @width
        height : @height
      )


class seen.SceneLayer extends seen.RenderLayer
  constructor : (@scene) ->

  render : (context) =>
    for renderModel in @scene.render()
      renderModel.surface.painter.paint(renderModel, context)


class seen.DebugLayer extends seen.RenderLayer
  constructor: (animator) ->
    @_msg = ''
    @_fps = 30

    animator.onBefore @_renderStart
    animator.onAfter @_renderEnd

  render : (context) =>
    context.text()
      .style(
        'fill' : '#000'
      )
      .transform(
        seen.M().translate(10 , 20).scale(1,-1,1)
      )
      .text(@_msg)

  _renderStart: =>
    @_renderStartTime = new Date()

  _renderEnd: =>
    # Compute frame time
    frameTime = 1000 / (new Date() - @_renderStartTime)
    # Smooth frame time
    if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
    # Record debug message
    @_msg = "fps: #{@_fps.toFixed(1)}" #" surfaces: #{e.length}"


seen.LayersScene = (context, scene, width = 400, height = 400) ->
  context
    .layer('background', new seen.FillLayer(width, height))
    .layer('scene',      new seen.SceneLayer(scene))
  return context
