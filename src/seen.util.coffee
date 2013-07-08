# ## Utils
# #### Utility methods
# ***

seen.Util = {
  # Copies default values. First, overwrite undefined attributes of `obj` from `opts`. Second, overwrite undefined attributes of `obj` from `defaults`.
  defaults: (obj, opts, defaults) ->
    for prop of opts
      if not obj[prop]? then obj[prop] = opts[prop]
    for prop of defaults
      if not obj[prop]? then obj[prop] = defaults[prop]

  # Returns `true` iff the supplied `Arrays` are the same size and contain the same values.
  arraysEqual: (a, b) ->
    if not a.length == b.length then return false
    for val, i in a
      if not (val == b[i]) then return false
    return true
}