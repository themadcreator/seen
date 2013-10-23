
seen.Events = {
  dispatch : () ->
    dispatch = new seen.Events.Dispatcher()
    for arg in arguments
      dispatch[arg] = seen.Events.Event()
    return dispatch
}

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

seen.Events.Event = ->
  listeners = []
  listenerMap = {}

  event = ->
    for l in listeners
      l.apply(@, arguments)

  event.on = (name, listener) ->
    existing = listenerMap[name]

    if existing
      listeners = listeners.slice(0, i = listeners.indexOf(existing)).concat(listeners.slice(i + 1))
      delete listenerMap[name]

    if listener
      listeners.push listener
      listenerMap[name] = listener

  return event
