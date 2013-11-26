
seen.WindowEvents = do ->
  dispatch = seen.Events.dispatch('mouseMove', 'mouseDown', 'mouseUp')
  window.onmouseup   = dispatch.mouseUp
  window.onmousemove = dispatch.mouseMove
  window.onmousedown = dispatch.mouseDown
  return {on : dispatch.on}

class seen.MouseEvents
  defaults:
    useWindowEvents : true

  constructor : (@el, options) ->
    seen.Util.defaults(@, options, @defaults)

    @_uid = seen.Util.uniqueId('mouser-')

    @_mouseDown = false

    if @useWindowEvents
      @el.onmousedown = @_onMouseDown
    else
      @el.onmousedown = @_onMouseDown
      @el.onmouseup   = @_onMouseUp
      @el.onmousemove = @_onMouseMove

    @dispatch = seen.Events.dispatch('dragStart', 'drag', 'dragEnd', 'mouseMove', 'mouseDown', 'mouseUp')
    @on       = @dispatch.on

  _onMouseMove : (e) =>
    @dispatch.mouseMove(e)
    if @_mouseDown then @dispatch.drag(e)

  _onMouseDown : (e) =>
    @_mouseDown = true
    if @useWindowEvents
      seen.WindowEvents.on "mouseUp.#{@_uid}", @_onMouseUp
      seen.WindowEvents.on "mouseMove.#{@_uid}", @_onMouseMove
    @dispatch.mouseDown(e)
    @dispatch.dragStart(e)

  _onMouseUp : (e) =>
    @_mouseDown = false
    if @useWindowEvents
      seen.WindowEvents.on "mouseUp.#{@_uid}", null
      seen.WindowEvents.on "mouseMove.#{@_uid}", null
    @dispatch.mouseUp(e)
    @dispatch.dragEnd(e)

class seen.Drag
  defaults:
    inertia           : false
    inertiaMsecDelay  : 30
    inertiaExtinction : 0.1

  constructor : (@el, options) ->
    seen.Util.defaults(@, options, @defaults)
    @_uid = seen.Util.uniqueId('dragger-')

    @_inertiaRunning = false
    @_dragState =
      dragging : false
      origin   : null
      last     : null
      inertia : [0,0]

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
      @_dragState.inertia = [e.pageX - @_dragState.last[0], e.pageY - @_dragState.last[1]]
      @_startInertia()

  _onDrag : (e) =>
    @dispatch.drag(
      offset         : [e.pageX - @_dragState.origin[0], e.pageY - @_dragState.origin[1]]
      offsetRelative : [e.pageX - @_dragState.last[0], e.pageY - @_dragState.last[1]]
    )
    @_dragState.last = [e.pageX, e.pageY]

  _onInertia : () =>
    return unless @_inertiaRunning

    @_dragState.inertia = @_dragState.inertia.map (i) => i * (1.0 - @inertiaExtinction)
    if Math.abs(@_dragState.inertia[0]) < 1 and Math.abs(@_dragState.inertia[1]) < 1
      @_stopInertia()
      return

    @dispatch.drag(
      offset         : [@_dragState.last[0] - @_dragState.origin[0], @_dragState.last[0] - @_dragState.origin[1]]
      offsetRelative : @_dragState.inertia
    )
    @_dragState.last = [@_dragState.last[0] + @_dragState.inertia[0], @_dragState.last[1] + @_dragState.inertia[1]]

    @_startInertia()

  _startInertia : =>
    @_inertiaRunning = true
    setTimeout(@_onInertia, @inertiaMsecDelay)

  _stopInertia : =>
    @_dragState.inertia = [0,0]
    @_inertiaRunning = false
