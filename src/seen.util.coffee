seen.Util = {
  defaults: (obj, opts, defaults) ->
    for prop of opts
      if not obj[prop]? then obj[prop] = opts[prop]
    for prop of defaults
      if not obj[prop]? then obj[prop] = defaults[prop]
}