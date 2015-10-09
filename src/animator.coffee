# ## Animator
# ------------------

# Polyfill requestAnimationFrame
if window?
  requestAnimationFrame =
      window.requestAnimationFrame ?
      window.mozRequestAnimationFrame ?
      window.webkitRequestAnimationFrame ?
      window.msRequestAnimationFrame

DEFAULT_FRAME_DELAY = 30 # msec

# The animator class is useful for creating an animation loop. We supply pre
# and post events for apply animation changes between frames.
class seen.Animator
  constructor : () ->
    @dispatch   = seen.Events.dispatch('beforeFrame', 'afterFrame', 'frame')
    @on         = @dispatch.on
    @timestamp  = 0
    @_running   = false
    @frameDelay = null

  # Start the animation loop.
  start : ->
    @_running   = true

    if @frameDelay?
      @_lastTime = new Date().valueOf()
      @_delayCompensation = 0

    @animateFrame()
    return @

  # Stop the animation loop.
  stop : ->
    @_running = false
    return @

  # Use requestAnimationFrame if available and we have no explicit frameDelay.
  # Otherwise, use a delay-compensated timeout.
  animateFrame : ->
    if requestAnimationFrame? and not @frameDelay?
      requestAnimationFrame(@frame)
    else
      # Perform frame delay compensation to make sure each frame is rendered at
      # the right time. This makes some animations more consistent
      delta = new Date().valueOf() - @_lastTime
      @_lastTime += delta
      @_delayCompensation += delta

      frameDelay = @frameDelay ? DEFAULT_FRAME_DELAY
      setTimeout(@frame, frameDelay - @_delayCompensation)
    return @

  # The main animation frame method
  frame : (t) =>
    return unless @_running

    # create timestamp param even if requestAnimationFrame isn't available
    @_timestamp    = t ? (@_timestamp + (@_msecDelay ? DEFAULT_FRAME_DELAY))
    deltaTimestamp = if @_lastTimestamp? then @_timestamp - @_lastTimestamp else @_timestamp

    @dispatch.beforeFrame(@_timestamp, deltaTimestamp)
    @dispatch.frame(@_timestamp, deltaTimestamp)
    @dispatch.afterFrame(@_timestamp, deltaTimestamp)

    @_lastTimestamp = @_timestamp

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
  defaults :
    duration : 100 # The duration of this transition in msec

  constructor : (options = {}) ->
    seen.Util.defaults(@, options, @defaults)

  update : (t) ->
    # Setup the first frame before the tick increment
    if not @t?
      @firstFrame()
      @startT = t

    # Execute a tick and draw a frame
    @t = t
    @tFrac = (@t - @startT) / @duration
    @frame()

    # Cleanup or update on last frame after tick
    if (@tFrac >= 1.0)
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
  update : (t) =>
    return unless @queue.length
    transitions = @queue.shift()
    transitions = transitions.filter (transition) -> transition.update(t)
    if transitions.length then @queue.unshift(transitions)

