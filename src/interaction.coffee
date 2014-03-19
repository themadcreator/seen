# ## Interaction
# ------------------

# A global window event dispatcher.
seen.WindowEvents = do ->
  dispatch = seen.Events.dispatch('mouseMove', 'mouseDown', 'mouseUp')
  window.addEventListener('mouseup', dispatch.mouseUp, true)
  window.addEventListener('mousedown', dispatch.mouseDown, true)
  window.addEventListener('mousemove', dispatch.mouseMove, true)
  return {on : dispatch.on}

# An event dispatcher for mouse and drag events on a single dom element.
# The available events are 'dragStart', 'drag', 'dragEnd', 'mouseMove', 'mouseDown', 'mouseUp'
class seen.MouseEvents
  constructor : (@el, options) ->
    seen.Util.defaults(@, options, @defaults)

    @_uid = seen.Util.uniqueId('mouser-')

    @dispatch = seen.Events.dispatch('dragStart', 'drag', 'dragEnd', 'mouseMove', 'mouseDown', 'mouseUp', 'mouseWheel')
    @on       = @dispatch.on

    @_mouseDown = false
    @attach()

  attach : () ->
    @el.addEventListener('mousedown', @_onMouseDown)
    @el.addEventListener('mousewheel', @_onMouseWheel)

  detach : () ->
    @el.removeEventListener('mousedown', @_onMouseDown)
    @el.removeEventListener('mousewheel', @_onMouseWheel)

  _onMouseMove : (e) =>
    @dispatch.mouseMove(e)
    if @_mouseDown then @dispatch.drag(e)

  _onMouseDown : (e) =>
    @_mouseDown = true
    seen.WindowEvents.on "mouseUp.#{@_uid}", @_onMouseUp
    seen.WindowEvents.on "mouseMove.#{@_uid}", @_onMouseMove
    @dispatch.mouseDown(e)
    @dispatch.dragStart(e)

  _onMouseUp : (e) =>
    @_mouseDown = false
    seen.WindowEvents.on "mouseUp.#{@_uid}", null
    seen.WindowEvents.on "mouseMove.#{@_uid}", null
    @dispatch.mouseUp(e)
    @dispatch.dragEnd(e)

  _onMouseWheel : (e) =>
    @dispatch.mouseWheel(e)

# A class for computing mouse interia for interial scrolling
class seen.InertialMouse
  @inertiaExtinction : 0.1
  @smoothingTimeout  : 300
  @inertiaMsecDelay  : 30

  constructor : ->
    @reset()

  get : ->
    scale = 1000 / seen.InertialMouse.inertiaMsecDelay
    return [@x * scale, @y * scale]

  reset : ->
    @xy = [0, 0]
    return @

  update : (xy) ->
    if @lastUpdate?
      msec = new Date().getTime() - @lastUpdate.getTime()
      # Compute pixels per milliseconds
      xy = xy.map (x) -> x / Math.max(msec, 1)
      # Compute interpolation parameter based on time between measurements
      t = Math.min(1, msec / seen.InertialMouse.smoothingTimeout)
      @x = t * xy[0] + (1.0 - t) * @x
      @y = t * xy[1] + (1.0 - t) * @y
    else
     [@x, @y] = xy

    @lastUpdate = new Date()
    return @

  damp : ->
    @x *= (1.0 - seen.InertialMouse.inertiaExtinction)
    @y *= (1.0 - seen.InertialMouse.inertiaExtinction)
    return @

# A class that adds simple mouse dragging to a dom element.
# A 'drag' event is emitted as the user is dragging their mouse.
class seen.Drag
  defaults:
    inertia : false

  constructor : (@el, options) ->
    seen.Util.defaults(@, options, @defaults)
    @el = seen.Util.element(@el)
    @_uid = seen.Util.uniqueId('dragger-')

    @_inertiaRunning = false
    @_dragState =
      dragging : false
      origin   : null
      last     : null
      inertia  : new seen.InertialMouse()

    @dispatch = seen.Events.dispatch('drag')
    @on       = @dispatch.on

    mouser = new seen.MouseEvents(@el)
    mouser.on "dragStart.#{@_uid}", @_onDragStart
    mouser.on "dragEnd.#{@_uid}", @_onDragEnd
    mouser.on "drag.#{@_uid}", @_onDrag

  _onDragStart : (e) =>
    @_stopInertia()
    @_dragState.dragging = true
    @_dragState.origin = [e.pageX, e.pageY]
    @_dragState.last   = [e.pageX, e.pageY]

  _onDragEnd : (e) =>
    @_dragState.dragging = false

    if @inertia
      dragEvent =
        offset         : [e.pageX - @_dragState.origin[0], e.pageY - @_dragState.origin[1]]
        offsetRelative : [e.pageX - @_dragState.last[0], e.pageY - @_dragState.last[1]]

      @_dragState.inertia.update(dragEvent.offsetRelative)
      @_startInertia()

  _onDrag : (e) =>
    dragEvent =
      offset         : [e.pageX - @_dragState.origin[0], e.pageY - @_dragState.origin[1]]
      offsetRelative : [e.pageX - @_dragState.last[0], e.pageY - @_dragState.last[1]]

    @dispatch.drag(dragEvent)

    if @inertia
      @_dragState.inertia.update(dragEvent.offsetRelative)

    @_dragState.last = [e.pageX, e.pageY]

  _onInertia : () =>
    return unless @_inertiaRunning

    # Apply damping and get x,y intertia values
    intertia = @_dragState.inertia.damp().get()

    if Math.abs(intertia[0]) < 1 and Math.abs(intertia[1]) < 1
      @_stopInertia()
      return

    @dispatch.drag(
      offset         : [@_dragState.last[0] - @_dragState.origin[0], @_dragState.last[0] - @_dragState.origin[1]]
      offsetRelative : intertia
    )
    @_dragState.last = [@_dragState.last[0] + intertia[0], @_dragState.last[1] + intertia[1]]

    @_startInertia()

  _startInertia : =>
    @_inertiaRunning = true
    setTimeout(@_onInertia, seen.InertialMouse.inertiaMsecDelay)

  _stopInertia : =>
    @_dragState.inertia.reset()
    @_inertiaRunning = false

class seen.Zoom
  constructor : (@el) ->
    @el       = seen.Util.element(@el)
    @_uid     = seen.Util.uniqueId('zoomer-')
    @dispatch = seen.Events.dispatch('zoom')
    @on       = @dispatch.on
    
    mouser    = new seen.MouseEvents(@el)
    mouser.on "mouseWheel.#{@_uid}", @_onMouseWheel

  _onMouseWheel : (e) =>
    sign       = e.wheelDelta / Math.abs(e.wheelDelta)
    zoomFactor = Math.abs(e.wheelDelta) / 120
    zoom       = Math.pow(2, sign*zoomFactor)
    @dispatch.zoom({sign, zoomFactor, zoom, e})
