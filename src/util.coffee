# ## Util
# #### Utility methods
# ------------------

NEXT_UNIQUE_ID = 1 # An auto-incremented value

seen.Util = {
  # Copies default values. First, overwrite undefined attributes of `obj` from
  # `opts`. Second, overwrite undefined attributes of `obj` from `defaults`.
  defaults: (obj, opts, defaults) ->
    for prop of opts
      if not obj[prop]? then obj[prop] = opts[prop]
    for prop of defaults
      if not obj[prop]? then obj[prop] = defaults[prop]

  # Returns `true` iff the supplied `Arrays` are the same size and contain the
  # same values.
  arraysEqual: (a, b) ->
    if not a.length == b.length then return false
    for val, i in a
      if not (val == b[i]) then return false
    return true

  # Returns an ID which is unique to this instance of the library
  uniqueId: (prefix = '') ->
    return prefix + NEXT_UNIQUE_ID++

  # Accept a DOM element or a string. If a string is provided, we assume it is
  # the id of an element, which we return.
  element : (elementOrString) ->
    if typeof elementOrString is 'string'
      return document.getElementById(elementOrString)
    else
      return elementOrString
}
