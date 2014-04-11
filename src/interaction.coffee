# ## Interaction
# #### Mouse drag and zoom
# ------------------

# A global window event dispatcher. Attaches listeners only if window is defined.
seen.WindowEvents = do ->
  dispatch = seen.Events.dispatch(
    'mouseMove'
    'mouseDown'
    'mouseUp'
    'touchStart'
    'touchMove'
    'touchEnd'
    'touchCancel'
  )

  if window?
    window.addEventListener('mouseup', dispatch.mouseUp, true)
    window.addEventListener('mousedown', dispatch.mouseDown, true)
    window.addEventListener('mousemove', dispatch.mouseMove, true)
    window.addEventListener('touchstart', dispatch.touchStart, true)
    window.addEventListener('touchmove', dispatch.touchMove, true)
    window.addEventListener('touchend', dispatch.touchEnd, true)
    window.addEventListener('touchcancel', dispatch.touchCancel, true)
  return {on : dispatch.on}

# An event dispatcher for mouse and drag events on a single dom element. The
# available events are `'dragStart', 'drag', 'dragEnd', 'mouseMove',
# 'mouseDown', 'mouseUp', 'mouseWheel'`
class seen.MouseEvents
  constructor : (@el, options) ->
    seen.Util.defaults(@, options, @defaults)

    @_uid = seen.Util.uniqueId('mouser-')

    @dispatch = seen.Events.dispatch(
      'dragStart'
      'drag'
      'dragEnd'
      'mouseMove'
      'mouseDown'
      'mouseUp'
      'mouseWheel'
    )
    @on = @dispatch.on

    @_mouseDown = false
    @attach()

  # Attaches listeners to the element
  attach : () ->
    @el.addEventListener('touchstart', @_onMouseDown)
    @el.addEventListener('mousedown', @_onMouseDown)
    @el.addEventListener('mousewheel', @_onMouseWheel)

  # Dettaches listeners to the element
  detach : () ->
    @el.removeEventListener('touchstart', @_onMouseDown)
    @el.removeEventListener('mousedown', @_onMouseDown)
    @el.removeEventListener('mousewheel', @_onMouseWheel)

  _onMouseMove : (e) =>
    @dispatch.mouseMove(e)
    e.preventDefault()
    e.stopPropagation()
    if @_mouseDown then @dispatch.drag(e)

  _onMouseDown : (e) =>
    @_mouseDown = true
    seen.WindowEvents.on "mouseUp.#{@_uid}", @_onMouseUp
    seen.WindowEvents.on "mouseMove.#{@_uid}", @_onMouseMove
    seen.WindowEvents.on "touchEnd.#{@_uid}", @_onMouseUp
    seen.WindowEvents.on "touchCancel.#{@_uid}", @_onMouseUp
    seen.WindowEvents.on "touchMove.#{@_uid}", @_onMouseMove
    @dispatch.mouseDown(e)
    @dispatch.dragStart(e)

  _onMouseUp : (e) =>
    @_mouseDown = false
    seen.WindowEvents.on "mouseUp.#{@_uid}", null
    seen.WindowEvents.on "mouseMove.#{@_uid}", null
    seen.WindowEvents.on "touchEnd.#{@_uid}", null
    seen.WindowEvents.on "touchCancel.#{@_uid}", null
    seen.WindowEvents.on "touchMove.#{@_uid}", null
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
      msec = new Date().getTime() - @lastUpdate.getTime() # Time passed
      xy = xy.map (x) -> x / Math.max(msec, 1) # Pixels per milliseconds
      t = Math.min(1, msec / seen.InertialMouse.smoothingTimeout) # Interpolation based on time between measurements
      @x = t * xy[0] + (1.0 - t) * @x
      @y = t * xy[1] + (1.0 - t) * @y
    else
     [@x, @y] = xy

    @lastUpdate = new Date()
    return @

  # Apply damping to slow the motion once the user has stopped dragging.
  damp : ->
    @x *= (1.0 - seen.InertialMouse.inertiaExtinction)
    @y *= (1.0 - seen.InertialMouse.inertiaExtinction)
    return @

# Adds simple mouse drag eventing to a DOM element. A 'drag' event is emitted
# as the user is dragging their mouse. This is the easiest way to add mouse-
# look or mouse-rotate to a scene.
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

  _getPageCoords : (e) =>
    return if e.touches?.length > 0
      [e.touches[0].pageX, e.touches[0].pageY]
    else if e.changedTouches?.length > 0
      [e.changedTouches[0].pageX, e.changedTouches[0].pageY]
    else
      [e.pageX, e.pageY]

  _onDragStart : (e) =>
    @_stopInertia()
    @_dragState.dragging = true
    @_dragState.origin   = @_getPageCoords(e)
    @_dragState.last     = @_getPageCoords(e)

  _onDragEnd : (e) =>
    @_dragState.dragging = false

    if @inertia
      page = @_getPageCoords(e)
      dragEvent =
        offset         : [page[0] - @_dragState.origin[0], page[1] - @_dragState.origin[1]]
        offsetRelative : [page[0] - @_dragState.last[0], page[1] - @_dragState.last[1]]

      @_dragState.inertia.update(dragEvent.offsetRelative)
      @_startInertia()

  _onDrag : (e) =>
    page = @_getPageCoords(e)

    dragEvent =
      offset         : [page[0] - @_dragState.origin[0], page[1] - @_dragState.origin[1]]
      offsetRelative : [page[0] - @_dragState.last[0], page[1]- @_dragState.last[1]]

    @dispatch.drag(dragEvent)

    if @inertia
      @_dragState.inertia.update(dragEvent.offsetRelative)

    @_dragState.last = page

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

# Adds simple mouse wheel eventing to a DOM element. A 'zoom' event is emitted
# as the user is scrolls their mouse wheel.
class seen.Zoom
  defaults :
    speed : 0.25

  constructor : (@el,  options) ->
    seen.Util.defaults(@, options, @defaults)
    @el       = seen.Util.element(@el)
    @_uid     = seen.Util.uniqueId('zoomer-')
    @dispatch = seen.Events.dispatch('zoom')
    @on       = @dispatch.on

    mouser    = new seen.MouseEvents(@el)
    mouser.on "mouseWheel.#{@_uid}", @_onMouseWheel

  _onMouseWheel : (e) =>
    # This prevents the page from scrolling when we mousewheel the element
    e.preventDefault()

    sign       = e.wheelDelta / Math.abs(e.wheelDelta)
    zoomFactor = Math.abs(e.wheelDelta) / 120 * @speed
    zoom       = Math.pow(2, sign*zoomFactor)

    @dispatch.zoom({zoom})
