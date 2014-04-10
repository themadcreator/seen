# ## Animator
# ------------------

# Polyfill requestAnimationFrame
if window?
  requestAnimationFrame =
      window.requestAnimationFrame ?
      window.mozRequestAnimationFrame ?
      window.webkitRequestAnimationFrame ?
      window.msRequestAnimationFrame

# The animator class is useful for creating an animation loop. We supply pre
# and post events for apply animation changes between frames.
class seen.Animator
  constructor : () ->
    @dispatch = seen.Events.dispatch('beforeFrame', 'afterFrame', 'frame')
    @on       = @dispatch.on
    @_running = false

  # Start the animation loop. The delay between frames can be supplied as an argument.
  start: (msecDelay) ->
    @_running   = true
    @_msecDelay = msecDelay
    @animateFrame()
    return @

  # Stop the animation loop.
  stop : ->
    @_running = false
    return @

  # Use requestAnimationFrame if available
  animateFrame : ->
    if requestAnimationFrame? and not @_msecDelay?
      requestAnimationFrame(@frame)
    else
      @_msecDelay ?= 30
      setTimeout(@frame, @_msecDelay)

  # The main animation frame method
  frame: () =>
    return unless @_running
    @dispatch.beforeFrame()
    @dispatch.frame()
    @dispatch.afterFrame()
    @animateFrame()
    return @

  # Add a callback that will be invoked before the frame
  onBefore : (handler) ->
    @on "beforeFrame.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a callback that will be invoked after the frame
  onAfter : (handler) ->
    @on "afterFrame.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a frame callback
  onFrame : (handler) ->
    @on "frame.#{seen.Util.uniqueId('animator-')}", handler
    return @

# A seen.Animator for rendering the seen.Context
class seen.RenderAnimator extends seen.Animator
  constructor : (context) ->
    super
    @onFrame(context.render)

 # A transition object to manage to animation of shapes
class seen.Transition
  constructor : (options = {}) ->
    seen.Util.defaults(@, options,
      tickIncrement : 0.2 # The amount to increase @t for each frame.
      lastT         : 1.0 # The value of @t that indicates the transition is complete.
    )
    @t = 0

  update : ->
    # Setup the first frame before the tick increment
    if (@t is 0)
      @firstFrame()

    # Execute a tick and draw a frame
    @t += @tickIncrement
    @frame()

    # Cleanup or update on last frame after tick
    if (@t >= @lastT)
      @lastFrame()
      return false

    return true

  firstFrame : ->
  frame      : ->
  lastFrame  : ->

# A seen.Animator for updating seen.Transtions. We include keyframing to make
# sure we wait for one transition to finish before starting the next one.
class seen.TransitionAnimator extends seen.Animator
  constructor : ->
    super
    @queue       = []
    @transitions = []
    @onFrame(@update)

  # Adds a transition object to the current set of transitions. Note that
  # transitions will not start until they have been enqueued by invoking
  # `keyframe()` on this object.
  add : (txn) ->
    @transitions.push txn

  # Enqueues the current set of transitions into the keyframe queue and sets
  # up a new set of transitions.
  keyframe : ->
    @queue.push @transitions
    @transitions = []

  # When this animator updates, it invokes `update()` on all of the
  # currently animating transitions. If any of the current transitions are
  # not done, we re-enqueue them at the front. If all transitions are
  # complete, we will start animating the next set of transitions from the
  # keyframe queue on the next update.
  update : =>
    return unless @queue.length
    transitions = @queue.shift()
    transitions = transitions.filter (transition) -> transition.update()
    if transitions.length then @queue.unshift(transitions)

