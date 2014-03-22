# ## Events
# ------------------

# Attribution: these have been adapted from d3.js's event dispatcher functions.

seen.Events = {
  # Return a new dispatcher that creates event types using
  # the supplied string argument list. The returned `Dispatcher`
  # will have methods with the names of the event types.
  dispatch : () ->
    dispatch = new seen.Events.Dispatcher()
    for arg in arguments
      dispatch[arg] = seen.Events.Event()
    return dispatch
}

# The `Dispatcher` class. These objects have methods that can be invoked like dispatch.eventName().
# Listeners can be registered with dispatch.on('eventName.uniqueId', callback). Listeners can
# be removed with dispatch.on('eventName.uniqueId', null).
#
# Note that only one listener with the name event name and id can be registered at once. If you
# to generate unique ids, you can use the seen.Util.uniqueId() method.
class seen.Events.Dispatcher
  on : (type, listener) =>
    i = type.indexOf '.'
    name = ''
    if i > 0
      name = type.substring(i + 1)
      type = type.substring(0, i)

    if @[type]?
      @[type].on(name, listener)

    return @

# Internal event object for storing listener callbacks and a map for easy lookup.
seen.Events.Event = ->
  event = ->
    for name, l of event.listenerMap
      if l? then l.apply(@, arguments)

  event.listenerMap = {}

  event.on = (name, listener) ->
    delete event.listenerMap[name]

    if listener
      event.listenerMap[name] = listener

  return event
