class seen.Model extends seen.Transformable
  constructor: () ->
    super()
    @children = []
    @lights = []

  add: (child) ->
    @children.push child
    return @

  append: () ->
    group = new seen.Model
    @add group
    return group

  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Model
        child.eachTransformedShape(f)

  eachTransformedShape: (f) ->
    @_eachTransformedShape(f, @lights, @m)

  _eachTransformedShape: (f, lights, m) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child, lights, child.m.multiply(m))
      if child instanceof seen.Model
        childLights = if child.lights.length is 0 then lights else lights.concat(child.lights)
        # TODO properly chain transforms onto lights
        child._eachTransformedShape(f, childLights, child.m.multiply(m))
