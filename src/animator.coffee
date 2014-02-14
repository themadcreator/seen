# ## Animator
# ------------------

# The animator class is useful for creating a render loop.
# We supply pre and post render events for apply animation changes between renders.
class seen.Animator
  constructor : () ->
    @dispatch = seen.Events.dispatch('beforeRender', 'afterRender', 'render')
    @on       = @dispatch.on
    @_running = false

  # Start the render loop. The delay between frames can be supplied as an argument.
  start: (msecDelay = 30) ->
    @_running   = true
    @_msecDelay = msecDelay
    setTimeout(@render, @_msecDelay)
    return @

  # Stop the render loop.
  stop : ->
    @_running = false
    return @

  # The main render loop method
  render: () =>
    return unless @_running
    @dispatch.beforeRender()
    @dispatch.render()
    @dispatch.afterRender()
    setTimeout(@render, @_msecDelay)
    return @

  # Add a callback that will be invoked before the render
  onBefore : (handler) ->
    @on "beforeRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a callback that will be invoked after the render
  onAfter : (handler) ->
    @on "afterRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a render callback
  onRender : (handler) ->
    @on "render.#{seen.Util.uniqueId('animator-')}", handler
    return @
