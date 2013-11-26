
class seen.Animator
  constructor : () ->
    @dispatch = seen.Events.dispatch('beforeRender', 'afterRender', 'render')
    @on       = @dispatch.on

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)
    return @

  render: () =>
    @dispatch.beforeRender()
    @dispatch.render()
    @dispatch.afterRender()
    return @

  onBefore : (handler) ->
    @on "beforeRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  onAfter : (handler) ->
    @on "afterRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  onRender : (handler) ->
    @on "render.#{seen.Util.uniqueId('animator-')}", handler
    return @
