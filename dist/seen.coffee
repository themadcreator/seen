

# ## Apache 2.0 License
# 
#     Copyright 2013 github/themadcreator
# 
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
# 
#        http://www.apache.org/licenses/LICENSE-2.0
# 
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
# 


# ## Init
# #### Module definition
# ------------------

# Declare and attach seen namespace
seen = (exports ? this).seen = {}

# ## Utils
# #### Utility methods
# ------------------

NEXT_UNIQUE_ID = 1

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

  # Returns an ID which is unique to this instance of the library
  uniqueId: (prefix = '') ->
    return prefix + NEXT_UNIQUE_ID++

  element : (elementOrString) ->
    if typeof elementOrString is 'string'
      return document.getElementById(elementOrString)
    else
      return elementOrString
}


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
  listeners = []
  listenerMap = {}

  event = ->
    for l in listeners
      if l? then l.apply(@, arguments)

  event.on = (name, listener) ->
    existing = listenerMap[name]

    if existing
      i = listeners.indexOf(existing)
      if i > 0 then listeners.splice(i, 1)
      delete listenerMap[name]

    if listener
      listeners.push listener
      listenerMap[name] = listener

  return event



# ## Math
# #### Matrices, points, and other mathy stuff
# ------------------

# Pool object to speed computation and reduce object creation
ARRAY_POOL = new Array(16)

# Definition of identity matrix values
IDENTITY = [1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0]

# The `Matrix` class stores transformations in the scene. These include:
# (1) Camera Projection and Viewport transformations.
# (2) Transformations of any `Transformable` type object, such as `Shapes`
#
# `Matrix` objects have two sets of manipulation methods.
# Normal methods (e.g. `translate`) are **non-destructive** -- i.e. they return a new object without modifying the existing object.
# Underscored methods (e.g. `_translate`) are **destructive** -- i.e. they modifying and return the existing object.
class seen.Matrix
  # Accepts a 16-value `Array`, defaults to the identity matrix.
  constructor: (@m = null) ->
    @m ?= IDENTITY.slice()
    return @

  # Returns a new matrix instances with a copy of the value array
  copy: ->
    return new seen.Matrix(@m.slice())

  # Resets the matrix to the identity matrix.
  reset: ->
    @m = IDENTITY.slice()
    return @

  # Multiply by the `Matrix` argument.
  multiply: (b) ->
    return @matrix(b.m)

  # Multiply by the 16-value `Array` argument. This method uses the `ARRAY_POOL`, which prevents us from having to re-initialize a new temporary matrix every time. This drastically improves performance.
  matrix: (m) ->
    c = ARRAY_POOL
    for j in [0...4]
      for i in [0...16] by 4
        c[i + j] =
          m[i    ] * @m[     j] +
          m[i + 1] * @m[ 4 + j] +
          m[i + 2] * @m[ 8 + j] +
          m[i + 3] * @m[12 + j]
    ARRAY_POOL = @m
    @m = c
    return @

  # Apply a rotation about the X axis. `Theta` is measured in Radians
  rotx: (theta) ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ 1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a rotation about the Y axis. `Theta` is measured in Radians
  roty: (theta)  ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a rotation about the Z axis. `Theta` is measured in Radians
  rotz: (theta) ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a translation. All arguments default to `0`
  translate: (x = 0, y = 0, z = 0) ->
    @m[3]  += x
    @m[7]  += y
    @m[11] += z
    return @

  # Apply a scale. If not all arguments are supplied, each dimension (x,y,z) is copied from the previous arugment. Therefore, `_scale()` is equivalent to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  scale: (sx, sy, sz) ->
    sx     ?= 1
    sy     ?= sx
    sz     ?= sy
    @m[0]  *= sx
    @m[5]  *= sy
    @m[10] *= sz
    return @

# A convenience method for constructing Matrix objects.
seen.M = (m) -> new seen.Matrix(m)

# A few useful Matrix objects. Be careful not to apply destructive operations to these objects.
seen.Matrices = {
  identity : -> seen.M()
  flipX    : -> seen.M().scale(-1, 1, 1)
  flipY    : -> seen.M().scale( 1,-1, 1)
  flipZ    : -> seen.M().scale( 1, 1,-1)
}

# `Transformable` base class extended by `Shape` and `Model`.
#
# The advantages of keeping transforms in `Matrix` form are (1) lazy computation of point position (2) ability combine hierarchical transformations easily (3) ability to reset transformations to an original state.
#
# Resetting transformations is especially useful when you want to animate interpolated values. Instead of computing the difference at each animation step, you can compute the global interpolated value for that time step and apply that value directly to a matrix (once it is reset).
class seen.Transformable
  constructor: ->
    @m = new seen.Matrix()
    for method in ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset'] then do (method) =>
      @[method] = ->
        @m[method].call(@m, arguments...)
        return @

  # Apply a transformation from the supplied `Matrix`. see `Matrix._multiply`
  transform: (m) ->
    @m.multiply(m)
    return @

# The `Point` object contains x,y,z, and w coordinates. `Points` support various arithmetic operations with other `Points`, scalars, or `Matrices`.
#
# Similar to the `Matrix` object. `Point` objects have **non-destructive** (e.g. `add`) methods, which return a new `Point` without modifying the current object, and **destrcutive** (e.g. `_add`) methods which modify the object.
class seen.Point
  constructor: (@x = 0, @y = 0, @z = 0, @w = 1) ->

  # Creates and returns a new `Point` with the same values as this object.
  copy: () ->
    return new seen.Point(@x, @y, @z, @w)

  # Copies the values of the supplied `Point` into this object.
  set: (p) ->
    @x = p.x
    @y = p.y
    @z = p.z
    @w = p.w
    return @

  # Performs parameter-wise addition with the supplied `Point`.
  add: (q) ->
    @x += q.x
    @y += q.y
    @z += q.z
    return @

  # Performs parameter-wise subtraction with the supplied `Point`.
  subtract: (q) ->
    @x -= q.x
    @y -= q.y
    @z -= q.z
    return @

  # Apply a translation
  translate: (x, y, z) ->
    @x += x
    @y += y
    @z += z
    return @

  # Multiplies each parameters by the supplied scalar value.
  multiply: (n) ->
    @x *= n
    @y *= n
    @z *= n
    return @

  # Divides each parameters by the supplied scalar value.
  divide: (n) ->
    @x /= n
    @y /= n
    @z /= n
    return @

  # Rounds each coordinate to the nearest integer.
  round: () ->
    @x = Math.round(@x)
    @y = Math.round(@y)
    @z = Math.round(@z)
    return @

  # Divides this `Point` by its magnitude.
  normalize: () ->
    n = Math.sqrt(@dot(@))
    if n == 0
      @set(seen.Points.Z)
    else
      @divide(n)
    return @

  # Apply a transformation from the supplied `Matrix`.
  transform: (matrix) ->
    r = POINT_POOL
    r.x = @x * matrix.m[0] + @y * matrix.m[1] + @z * matrix.m[2] + @w * matrix.m[3]
    r.y = @x * matrix.m[4] + @y * matrix.m[5] + @z * matrix.m[6] + @w * matrix.m[7]
    r.z = @x * matrix.m[8] + @y * matrix.m[9] + @z * matrix.m[10] + @w * matrix.m[11]
    r.w = @x * matrix.m[12] + @y * matrix.m[13] + @z * matrix.m[14] + @w * matrix.m[15]

    @set(r)
    return @

  # Computes the dot product with the supplied `Point`.
  dot: (q) ->
    return @x * q.x + @y * q.y + @z * q.z

  # Computes the cross product with the supplied `Point`.
  cross: (q) ->
    r = POINT_POOL
    r.x = @y * q.z - @z * q.y
    r.y = @z * q.x - @x * q.z
    r.z = @x * q.y - @y * q.x

    @set(r)
    return @

# Convenience method for creating `Points`.
seen.P = (x,y,z,w) -> new seen.Point(x,y,z,w)

# A pool object which prevents us from having to create new `Point` objects for various calculations, which vastly improves performance.
POINT_POOL = seen.P()

# A few useful `Point` objects. Be sure that you don't invoke destructive methods on these objects.
seen.Points = {
  X    : seen.P(1, 0, 0)
  Y    : seen.P(0, 1, 0)
  Z    : seen.P(0, 0, 1)
  ZERO : seen.P(0, 0, 0)
}

# A Quaterionion class for computing quaterion multiplications. This creates more natural mouse rotations.
#
# Attribution: adapted from http://glprogramming.com/codedump/godecho/quaternion.html
class seen.Quaternion
  @pixelsPerRadian : 150

  # Convert the x and y pixel offsets into a rotation matrix
  @xyToTransform : (x, y) ->
    quatX = seen.Quaternion.pointAngle(seen.Points.Y, x / seen.Quaternion.pixelsPerRadian)
    quatY = seen.Quaternion.pointAngle(seen.Points.X, y / seen.Quaternion.pixelsPerRadian)
    return quatX.multiply(quatY).toMatrix()

  # Create a rotation matrix from the axis defined by x, y, and z values, and the supplied angle.
  @axisAngle : (x, y, z, angleRads) ->
    scale = Math.sin(angleRads / 2.0)
    w     = Math.cos(angleRads / 2.0)
    return new seen.Quaternion(scale * x, scale * y, scale * z, w)

  # Create a rotation matrix from the axis defined by the supplied point and the supplied angle.
  @pointAngle : (p, angleRads) ->
    scale = Math.sin(angleRads / 2.0)
    w     = Math.cos(angleRads / 2.0)
    return new seen.Quaternion(scale * p.x, scale * p.y, scale * p.z, w)

  constructor : ->
    @q = seen.P(arguments...)

  # Multiply this `Quaterionion` by the `Quaternion` argument.
  multiply : (q) ->
    r = seen.P()

    r.w = @q.w * q.q.w - @q.x * q.q.x - @q.y * q.q.y - @q.z * q.q.z
    r.x = @q.w * q.q.x + @q.x * q.q.w + @q.y * q.q.z - @q.z * q.q.y
    r.y = @q.w * q.q.y + @q.y * q.q.w + @q.z * q.q.x - @q.x * q.q.z
    r.z = @q.w * q.q.z + @q.z * q.q.w + @q.x * q.q.y - @q.y * q.q.x

    result = new seen.Quaternion()
    result.q = r
    return result

  # Convert this `Quaterion` into a transformation matrix.
  toMatrix : ->
    m = new Array(16)

    m[ 0] = 1.0 - 2.0 * ( @q.y * @q.y + @q.z * @q.z )
    m[ 1] = 2.0 * ( @q.x * @q.y - @q.w * @q.z )
    m[ 2] = 2.0 * ( @q.x * @q.z + @q.w * @q.y )
    m[ 3] = 0.0

    m[ 4] = 2.0 * ( @q.x * @q.y + @q.w * @q.z )
    m[ 5] = 1.0 - 2.0 * ( @q.x * @q.x + @q.z * @q.z )
    m[ 6] = 2.0 * ( @q.y * @q.z - @q.w * @q.x )
    m[ 7] = 0.0

    m[ 8] = 2.0 * ( @q.x * @q.z - @q.w * @q.y )
    m[ 9] = 2.0 * ( @q.y * @q.z + @q.w * @q.x )
    m[10] = 1.0 - 2.0 * ( @q.x * @q.x + @q.y * @q.y )
    m[11] = 0.0

    m[12] = 0
    m[13] = 0
    m[14] = 0
    m[15] = 1.0
    return seen.M(m)




# ## Color
# ------------------

# `Color` objects store RGB and Alpha values from 0 to 255.
class seen.Color
  constructor: (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

  # Returns a new `Color` object with the same rgb and alpha values as the current object
  copy: () ->
    return new seen.Color(@r, @g, @b, @a)

  # Scales the rgb channels by the supplied scalar value.
  scale: (n) ->
    @r *= n
    @g *= n
    @b *= n
    return @

  # Offsets each rgb channel by the supplied scalar value.
  offset: (n) ->
    @r += n
    @g += n
    @b += n
    return @

  # Clamps each rgb channel to the supplied minimum and maximum scalar values.
  clamp: (min = 0, max = 0xFF) ->
    @r = Math.min(max, Math.max(min, @r))
    @g = Math.min(max, Math.max(min, @g))
    @b = Math.min(max, Math.max(min, @b))
    return @

  # Takes the minimum between each channel of this `Color` and the supplied `Color` object.
  minChannels: (c) ->
    @r = Math.min(c.r, @r)
    @g = Math.min(c.g, @g)
    @b = Math.min(c.b, @b)
    return @

  # Adds the channels of the current `Color` with each respective channel from the supplied `Color` object.
  addChannels: (c) ->
    @r += c.r
    @g += c.g
    @b += c.b
    return @

  # Multiplies the channels of the current `Color` with each respective channel from the supplied `Color` object.
  multiplyChannels: (c) ->
    @r *= c.r
    @g *= c.g
    @b *= c.b
    return @

  # Converts the `Color` into a hex string of the form "#RRGGBB".
  hex: () ->
    c = (@r << 16 | @g << 8 | @b).toString(16)
    while (c.length < 6) then c = '0' + c
    return '#' + c

  # Converts the `Color` into a CSS-style string of the form "rgba(RR, GG, BB, AA)"
  style: () ->
    return "rgba(#{@r},#{@g},#{@b},#{@a})"

seen.Colors = {
  # Creates a new `Color` using the supplied rgb and alpha values.
  #
  # Each value must be in the range [0, 255] or, equivalently, [0x00, 0xFF].
  rgb: (r, g, b, a = 255) ->
    return new seen.Color(r, g, b, a)

  # Creates a new `Color` using the supplied hex string of the form "#RRGGBB".
  hex: (hex) ->
    hex = hex.substring(1) if (hex.charAt(0) == '#')
    return new seen.Color(
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16))

  # Creates a new `Color` using the supplied hue, saturation, and lightness (HSL) values.
  #
  # Each value must be in the range [0.0, 1.0].
  hsl: (h, s, l, a = 1) ->
    r = g = b = 0
    if (s == 0)
      # When saturation is 0, the color is "achromatic" or "grayscale".
      r = g = b = l
    else
      hue2rgb = (p, q, t) ->
        if (t < 0)
          t += 1
         else if (t > 1)
          t -= 1

        if (t < 1 / 6)
          return p + (q - p) * 6 * t
        else if (t < 1 / 2)
          return q
        else if (t < 2 / 3)
          return p + (q - p) * (2 / 3 - t) * 6
        else
          return p

      q = if l < 0.5 then l * (1 + s) else l + s - l * s
      p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)

    return new seen.Color(r * 255, g * 255, b * 255, a * 255)

  # Generates a new random color for each surface of the supplied `Shape`
  randomSurfaces : (shape, sat = 0.5, lit = 0.4) ->
    for surface in shape.surfaces
      surface.fill = new seen.Material seen.Colors.hsl(Math.random(), sat, lit)

  # Generates a random hue then randomly drifts the hue for each surface of the supplied `Shape`
  randomSurfaces2 : (shape, drift = 0.03, sat = 0.5, lit = 0.4) ->
    hue = Math.random()
    for surface in shape.surfaces
      hue += (Math.random() - 0.5) * drift
      if hue < 0 then hue = 1
      if hue > 1 then hue = 0
      surface.fill = new seen.Material seen.Colors.hsl(hue, 0.5, 0.4)

  # Generates a random color then sets the fill for every surface of the supplied `Shape`
  randomShape : (shape, sat = 0.5, lit = 0.4) ->
    shape.fill new seen.Material seen.Colors.hsl(Math.random(), sat, lit)

  # A few `Color`s are supplied for convenience.
  black : -> @hex('#000000')
  white : -> @hex('#FFFFFF')
  gray  : -> @hex('#888888')
}

# Convenience `Color` constructor.
seen.C = (r,g,b,a) -> new seen.Color(r,g,b,a)



# ## Materials
# #### Colors and surface material properties used by shaders.
# ------------------


# `Material` objects hold the attributes that desribe the color and finish of a surface.
class seen.Material
  defaults :
    # The base color of the material
    color            : seen.Colors.gray()
    # The `metallic` attribute determines how the specular highlights are calculated. Normally, specular highlights are the color of the light source. If metallic is true, specular highlight colors are determined from the `specularColor` attribute.
    metallic         : false
    # The color used for specular highlights when `metallic` is true
    specularColor    : seen.Colors.white()
    # The `specularExponent` determines how "shiny" the material is. A low exponent will create a low-intesity, diffuse specular shine. A high exponent will create an intense, point-like specular shine.
    specularExponent : 8
    # A `Shader` object may be supplied to override the shader used for this material. For example, if you want to apply a flat color to text or other shapes, set this value to `seen.Shaders.Flat`.
    shader           : null

  constructor : (@color, options = {}) ->
    seen.Util.defaults(@, options, @defaults)

  # Apply the shader's shading to this material, with the option to override the shader with the material's shader (if defined).
  render : (lights, shader, renderData) ->
    renderShader = @shader ? shader
    color = renderShader.shade(lights, renderData, @)
    color.a = @color.a
    return color


# ## Lighting
# #### Lights and various shaders
# ------------------

# This model object holds the attributes and transformation of a light source.
class seen.Light extends seen.Transformable
  defaults :
    point     : seen.P()
    color     : seen.Colors.white()
    intensity : 0.01
    normal    : seen.P(1, -1, -1).normalize()
    enabled   : true

  constructor: (@type, options) ->
    super
    seen.Util.defaults(@, options, @defaults)
    @id = 'l' + seen.Util.uniqueId()

  render : ->
    @colorIntensity = @color.copy().scale(@intensity)

seen.Lights = {
  point       : (opts) -> new seen.Light 'point', opts
  directional : (opts) -> new seen.Light 'directional', opts
  ambient     : (opts) -> new seen.Light 'ambient', opts
}


# ## Shaders
# ------------------

# Shader functions are aggregated in this utils object
seen.ShaderUtils = {
  applyDiffuse : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot))

  applyDiffuseAndSpecular : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot))

      # Compute and apply specular phong shading
      eyeNormal         = seen.Points.Z
      reflectionNormal  = surfaceNormal.copy().multiply(dot * 2).subtract(lightNormal)
      specularIntensity = Math.pow(1 + reflectionNormal.dot(eyeNormal), material.specularExponent)
      specularColor     = material.specularColor.copy().scale(specularIntensity * light.intensity / 255.0)
      c.addChannels(specularColor)

  applyAmbient : (c, light) ->
    # Apply ambient shading
    c.addChannels(light.colorIntensity)
}

# The `Shader` class is the base class for all shader objects.
class seen.Shader
  # Every `Shader` implementation must override the `shade` method.
  #
  # `lights` is an object containing the ambient, point, and directional light sources.
  # `renderModel` is an instance of `RenderModel` and contains the transformed and projected surface data.
  # `material` is an instance of `Material` and contains the color and other attributes for determining how light reflects off the surface.
  shade: (lights, renderModel, material) ->
    # Override this

# The `Phong` shader implements the Phong shading model with a diffuse, specular, and ambient term.
#
# See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
class Phong extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'point'
          lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize()
          seen.ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material)
        when 'directional'
          seen.ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material)
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color)

    if material.metallic
      c.minChannels(material.specularColor)

    c.clamp(0, 0xFF)
    return c

# The `DiffusePhong` shader implements the Phong shading model with a diffuse and ambient term (no specular).
class DiffusePhong extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'point'
          lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize()
          seen.ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material)
        when 'directional'
          seen.ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material)
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color).clamp(0, 0xFF)
    return c

# The `Ambient` shader colors surfaces from ambient light only.
class Ambient extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color).clamp(0, 0xFF)
    return c

# The `Flat` shader colors surfaces with the material color, disregarding all light sources.
class Flat extends seen.Shader
  shade: (lights, renderModel, material) ->
    return material.color

# Since `Shader` objects are stateless, we don't need to construct them more than once.
# So, we export global instances here.
seen.Shaders = {
  phong   : new Phong()
  diffuse : new DiffusePhong()
  ambient : new Ambient()
  flat    : new Flat()
}


# ## Contexts
# #### Base classes for rendering context and layers
# ------------------

# The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
# Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
class seen.RenderContext
  constructor: ->
    @layers = {}

  render: () =>
    @reset()
    for key, layer of @layers
      layer.context.reset()
      layer.layer.render(layer.context)
      layer.context.cleanup()
    @cleanup()
    return @

  # Returns a new `Animator` with this context's render method pre-registered.
  animate : ->
    return new seen.Animator().onRender(@render)

  # Add a new `RenderLayerContext` to this context. This allows us to easily stack paintable components such as
  # a fill backdrop, or even multiple scenes in one context.
  layer: (name, layer) ->
    @layers[name] = {
      layer   : layer
      context : @
    }
    return @

  reset   : ->
  cleanup : ->

# The `RenderLayerContext` defines the interface for producing builders that can paint various things into the current layer.
class seen.RenderLayerContext
  path    : -> # Return a path builder
  text    : -> # Return a text builder
  rect    : -> # Return a rect builder

  reset   : ->
  cleanup : ->



# ## Painters
# #### Defines the methods of painting a surface.
# ------------------

# Each `Painter` overrides the paint method. It uses the supplied `RenderLayerContext`'s builders
# to create and style the geometry on screen.
class seen.Painter
  paint : (renderModel, context) ->

class PathPainter extends seen.Painter
  paint : (renderModel, context) ->
    context.path()
      .style(
        fill           : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        stroke         : if not renderModel.stroke? then 'none' else renderModel.stroke.hex()
        'fill-opacity' : if not renderModel.fill?.a? then 1.0 else (renderModel.fill.a / 255.0)
        'stroke-width' : renderModel.surface['stroke-width'] ? 1
      )
      .path(renderModel.projected.points)
      .fill()

class TextPainter extends seen.Painter
  paint : (renderModel, context) ->
    xform = renderModel.transform.copy().multiply renderModel.projection
    context.text()
      .style(
        fill          : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        'text-anchor' : renderModel.surface.anchor ? 'middle'
      )
      .text(xform, renderModel.surface.text)

seen.Painters = {
  path  : new PathPainter()
  text  : new TextPainter()
}


# ## RenderModels
# ------------------

# The `RenderModel` object contains the transformed and projected points as well as various data
# needed to shade and paint a `Surface`.
#
# Once initialized, the object will have a constant memory footprint
# down to `Number` primitives. Also, we compare each transform and projection
# to prevent unnecessary re-computation. 
# 
# If you need to force a re-computation, mark the surface as 'dirty'.
class seen.RenderModel
  constructor: (@surface, @transform, @projection) ->
    @points      = @surface.points
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection) ->
    if not @surface.dirty and seen.Util.arraysEqual(transform.m, @transform.m) and seen.Util.arraysEqual(projection.m, @projection.m)
      return
    else
      @transform  = transform
      @projection = projection
      @_update()

  _update: () ->
    @_math(@transformed, @points, @transform, false)
    @_math(@projected, @transformed.points, @projection, true)
    @surface.dirty = false

  _initRenderData: ->
    return {
      points     : (p.copy() for p in @points)
      barycenter : seen.P()
      normal     : seen.P()
      v0         : seen.P()
      v1         : seen.P()
    }

  _math: (set, points, transform, applyClip = false) ->
    # Apply transform to points
    for p,i in points
      sp = set.points[i]
      sp.set(p).transform(transform)
      # Applying the clip is what ultimately scales the x and y coordinates in a perpsective projection
      if applyClip then sp.divide(sp.w)

    # Compute barycenter, which is used in aligning shapes in the painters algorithm
    set.barycenter.set(seen.Points.ZERO)
    for p in set.points
      set.barycenter.add(p)
    set.barycenter.divide(set.points.length)

    # Compute normal, which is used for backface culling (when enabled)
    if set.points.length < 2
      set.v0.set(seen.Points.Z)
      set.v1.set(seen.Points.Z)
      set.normal.set(seen.Points.Z)
    else
      set.v0.set(set.points[1]).subtract(set.points[0])
      set.v1.set(set.points[points.length - 1]).subtract(set.points[0])
      set.normal.set(set.v0).cross(set.v1).normalize()

# The `LightRenderModel` stores pre-computed values necessary for shading surfaces with the supplied `Light`.
class seen.LightRenderModel
  constructor: (light, transform) ->
    @colorIntensity = light.color.copy().scale(light.intensity)
    @type           = light.type
    @intensity      = light.intensity
    @point          = light.point.copy().transform(transform)
    origin          = seen.Points.ZERO.copy().transform(transform)
    @normal         = light.normal.copy().transform(transform).subtract(origin).normalize()




class seen.RenderLayer
  render: (context) =>


class seen.FillLayer extends seen.RenderLayer
  constructor : (@width = 500, @height = 500, @fill = '#EEE') ->

  render: (context) =>
    context.rect()
      .style(
        fill : @fill
      )
      .size(
        width  : @width
        height : @height
      )


class seen.SceneLayer extends seen.RenderLayer
  constructor : (@scene) ->

  render : (context) =>
    for renderModel in @scene.render()
      renderModel.surface.painter.paint(renderModel, context)


class seen.DebugLayer extends seen.RenderLayer
  constructor: (animator) ->
    @_msg = ''
    @_fps = 30

    animator.onBefore @_renderStart
    animator.onAfter @_renderEnd

  render : (context) =>
    context.text()
      .style(
        'fill' : '#000'
      )
      .transform(
        seen.M().translate(10 , 20).scale(1,-1,1)
      )
      .text(@_msg)

  _renderStart: =>
    @_renderStartTime = new Date()

  _renderEnd: =>
    # Compute frame time
    frameTime = 1000 / (new Date() - @_renderStartTime)
    # Smooth frame time
    if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
    # Record debug message
    @_msg = "fps: #{@_fps.toFixed(1)}" #" surfaces: #{e.length}"


seen.LayersScene = (context, scene, width = 400, height = 400) ->
  context
    .layer('background', new seen.FillLayer(width, height))
    .layer('scene',      new seen.SceneLayer(scene))
  return context



_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

_line = (points) ->
  return 'M' + points.map((p) -> "#{p.x} #{p.y}").join 'L'

class seen.SvgStyler
  setElement: (@el) ->

  style: (style) ->
    str = ''
    for key,val of style
      str += "#{key}:#{val};"
    @el.setAttribute('style', str)

    return @

  # Included for compatibility with the common API w/ canvas
  fill : -> return @
  draw : -> return @

class seen.SvgPathPainter extends seen.SvgStyler
  path: (points) ->
    @el.setAttribute('d', _line(points))
    return @

class seen.SvgTextPainter extends seen.SvgStyler
  text: (transform, text) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @el.setAttribute('transform', "matrix(#{m[0]} #{m[4]} #{m[1]} #{m[5]} #{m[3]} #{m[7]})")
    @el.textContent = text
    return @

class seen.SvgRectPainter extends seen.SvgStyler
  rect: ({width, height}) ->
    @el.setAttribute('width', width)
    @el.setAttribute('height', height)
    return @

class seen.SvgLayerRenderContext extends seen.RenderLayerContext
  constructor : (@group) ->
    @pathPainter = new seen.SvgPathPainter()
    @textPainter = new seen.SvgTextPainter()
    @rectPainter = new seen.SvgRectPainter()
    @_i = 0

  path : () ->
    el = @_manifest('path')
    @pathPainter.setElement el
    return @pathPainter

  text : () ->
    el = @_manifest('text')
    el.setAttribute 'font-family', 'Roboto'
    @textPainter.setElement el
    return @textPainter

  rect : (dims) ->
    el = @_manifest('rect')
    @rectPainter.setElement el
    return @rectPainter

  reset : ->
    @_i = 0

  cleanup : ->
    children = @group.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  _manifest : (type) ->
    children = @group.childNodes
    if @_i >= children.length
      path = _svg(type)
      @group.appendChild(path)
      @_i++
      return path

    current = children[@_i]
    if current.tagName is type
      @_i++
      return current
    else
      path = _svg(type)
      @group.replaceChild(path, current)
      @_i++
      return path

class seen.SvgRenderContext extends seen.RenderContext
  constructor : (@svg) ->
    super()
    @svg = seen.Util.element(@svg)

  layer : (name, layer) ->
    @svg.appendChild(group = _svg('g'))
    @layers[name] = {
      layer   : layer
      context : new seen.SvgLayerRenderContext(group)
    }
    return @

seen.SvgContext = (elementId, scene, width, height) ->
  context = new seen.SvgRenderContext(elementId)
  return seen.LayersScene(context, scene, width, height)


class seen.CanvasStyler
  constructor : (@ctx) ->

  style: (style) ->
    for key, val of style
      switch key
        when 'fill' then @ctx.fillStyle = val
        when 'stroke' then @ctx.strokeStyle = val
    return @

  draw : ->
    @ctx.stroke()
    return @

  fill : ->
    @ctx.fill()
    return @

class seen.CanvasPathPainter extends seen.CanvasStyler
  path: (points) ->
    @ctx.beginPath()

    for p, i in points
      if i is 0
        @ctx.moveTo(p.x, p.y)
      else
        @ctx.lineTo(p.x, p.y)

    @ctx.closePath()
    return @

class seen.CanvasRectPainter extends seen.CanvasStyler
  rect: ({width, height}) ->
    @ctx.rect(0, 0, width, height)
    return @

class seen.CanvasPointPainter extends seen.CanvasStyler
  circle: (point, radius) ->
    @ctx.beginPath()
    @ctx.arc(point.x, point.y, radius, 0, 2*Math.PI, true)
    return @

class seen.CanvasTextPainter extends seen.CanvasStyler
  text: (transform, text) ->
    m = seen.Matrices.flipY().multiply(transform).m
    @ctx.save()
    @ctx.font = '16px Roboto' # TODO method
    @ctx.setTransform(m[0], m[4], m[1], m[5], m[3], m[7])
    @ctx.fillText(text, 0, 0)
    @ctx.restore()
    return @

class seen.CanvasLayerRenderContext extends seen.RenderLayerContext
  constructor : (@ctx) ->
    @pathPainter  = new seen.CanvasPathPainter(@ctx)
    @pointPainter = new seen.CanvasPointPainter(@ctx)
    @textPainter  = new seen.CanvasTextPainter(@ctx)
    @rectPainter  = new seen.CanvasRectPainter(@ctx)

  path : () ->
    return @pathPainter

  point : () ->
    return @pointPainter

  text : () ->
    return @textPainter

  rect : () ->
    return @rectPainter

class seen.CanvasRenderContext extends seen.RenderContext
  constructor: (@el, @width, @height) ->
    super()
    @el  = seen.Util.element(@el)
    @ctx = @el.getContext('2d')

  layer : (name, layer) ->
    @layers[name] = {
      layer   : layer
      context : new seen.CanvasLayerRenderContext(@ctx)
    }
    return @

  reset : ->
    @ctx.clearRect(0, 0, @width, @height)


seen.CanvasContext = (elementId, scene, width, height) ->
  context = new seen.CanvasRenderContext(elementId, width, height)
  return seen.LayersScene(context, scene, width, height)



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



# ## Surfaces and Shapes
# ------------------

# A `Surface` is a defined as a planar object in 3D space. These paths don't necessarily need
# to be convex, but they should be non-degenerate. This library does not support shapes with holes.
class seen.Surface
  # When 'false' this will override backface culling, which is useful if your material is transparent
  cullBackfaces : true
  # Fill and stroke may be `Material` objects, which define the color and finish of the object and are rendered using the scene's shader.
  fill          : new seen.Material(seen.C.gray)
  stroke        : null

  constructor: (@points, @painter = seen.Painters.path) ->
    @id = 's' + seen.Util.uniqueId()

# A `Shape` contains a collection of surface. They may create a closed 3D shape, but not necessarily.
# For example, a cube is a closed shape, but a patch is not.
class seen.Shape extends seen.Transformable
  constructor: (@type, @surfaces) ->
    super()

  # Visit each surface
  eachSurface: (f) ->
    @surfaces.forEach(f)
    return @

  # Apply the supplied fill `Material` to each surface
  fill: (fill) ->
    @eachSurface (s) -> s.fill = fill
    return @

  # Apply the supplied stroke `Material` to each surface
  stroke: (stroke) ->
    @eachSurface (s) -> s.stroke = stroke
    return @


# The object model class.
# This class stores `Shapes`, `Lights`, and other `Models`
# Since it extends `Transformable` it also contains a transformation matrix.
class seen.Model extends seen.Transformable
  constructor: () ->
    super()
    @children = []
    @lights   = []

  # Add a `Shape`, `Light`, and other `Model` as a child of this `Model`
  # Any number of children can by supplied as arguments.
  add: (childs...) ->
    for child in childs
      if child instanceof seen.Shape or child instanceof seen.Model
        @children.push child
      else if child instanceof seen.Light
        @lights.push child
    return @

  # Create a new child model and return it.
  append: () ->
    model = new seen.Model
    @add model
    return model

  # Visit each `Shape` in this `Model` and all recursive child `Model`s
  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Model
        child.eachShape(f)

  # Visit each `Light` and `Shape`, accumulating the recursive transformation matrices
  # along the way. The light callback will be called with each light and its accumulated
  # transform and it should return a `LightModel`. Each shape callback with be called
  # with each shape and its accumulated transform as well as the list of light models 
  # that apply to that shape.
  eachRenderable : (lightFn, shapeFn) ->
    @_eachRenderable(lightFn, shapeFn, [], @m)

  _eachRenderable : (lightFn, shapeFn, lightModels, transform) ->
    if @lights.length > 0 then lightModels = lightModels.slice()
    for light in @lights
      continue unless light.enabled
      lightModels.push lightFn.call(@, light, light.m.copy().multiply(transform))

    for child in @children
      if child instanceof seen.Shape
        shapeFn.call(@, child, lightModels, child.m.copy().multiply(transform))
      if child instanceof seen.Model
        child._eachRenderable(lightFn, shapeFn, lightModels, child.m.copy().multiply(transform))


seen.Models = {
  # The default model contains standard Hollywood-style 3-part lighting
  default : ->
    model = new seen.Model()

    # Key light
    model.add seen.Lights.directional
      normal    : seen.P(-1, 1, 1).normalize()
      color     : seen.Colors.hsl(0.1, 0.3, 0.7)
      intensity : 0.004

    # Back light
    model.add seen.Lights.directional
      normal    : seen.P(1, 1, -1).normalize()
      intensity : 0.003

    # Fill light
    model.add seen.Lights.ambient
      intensity : 0.0015

    return model
}


# ## Shapes
# #### Shape primitives and shape-making methods
# ------------------

EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0

ICOS_X = 0.525731112119133606
ICOS_Z = 0.850650808352039932
ICOSAHEDRON_POINTS = [
  seen.P(-ICOS_X, 0.0,     -ICOS_Z)
  seen.P(ICOS_X,  0.0,     -ICOS_Z)
  seen.P(-ICOS_X, 0.0,     ICOS_Z)
  seen.P(ICOS_X,  0.0,     ICOS_Z)
  seen.P(0.0,     ICOS_Z,  -ICOS_X)
  seen.P(0.0,     ICOS_Z,  ICOS_X)
  seen.P(0.0,     -ICOS_Z, -ICOS_X)
  seen.P(0.0,     -ICOS_Z, ICOS_X)
  seen.P(ICOS_Z,  ICOS_X,  0.0)
  seen.P(-ICOS_Z, ICOS_X,  0.0)
  seen.P(ICOS_Z,  -ICOS_X, 0.0)
  seen.P(-ICOS_Z, -ICOS_X, 0.0)
]

ICOSAHEDRON_COORDINATE_MAP = [
  [0, 4, 1]
  [0, 9, 4]
  [9, 5, 4]
  [4, 5, 8]
  [4, 8, 1]
  [8, 10, 1]
  [8, 3, 10]
  [5, 3, 8]
  [5, 2, 3]
  [2, 7, 3]
  [7, 10, 3]
  [7, 6, 10]
  [7, 11, 6]
  [11, 0, 6]
  [0, 1, 6]
  [6, 1, 10]
  [9, 0, 11]
  [9, 11, 2]
  [9, 2, 5]
  [7, 2, 11]
]

seen.Shapes = {
  _cubeCoordinateMap : [
    [0, 1, 3, 2] # left
    [5, 4, 6, 7] # right
    [1, 0, 4, 5] # bottom
    [2, 3, 7, 6] # top
    [3, 1, 5, 7] # front
    [0, 2, 6, 4] # back
  ]

  _mapPointsToSurfaces: (points, coordinateMap) ->
    surfaces = []
    for coords in coordinateMap
      spts = (points[c].copy() for c in coords)
      surfaces.push(new seen.Surface(spts))
    return surfaces

  _subdivideTriangles : (triangles) ->
    newTriangles = []
    for tri in triangles
      v01 = tri[0].copy().add(tri[1]).normalize()
      v12 = tri[1].copy().add(tri[2]).normalize()
      v20 = tri[2].copy().add(tri[0]).normalize()
      newTriangles.push [tri[0], v01, v20]
      newTriangles.push [tri[1], v12, v01]
      newTriangles.push [tri[2], v20, v12]
      newTriangles.push [v01,    v12, v20]
    return newTriangles

  # Returns a 2x2x2 cube, centered on the origin
  cube: =>
    points = [
      seen.P(-1, -1, -1)
      seen.P(-1, -1,  1)
      seen.P(-1,  1, -1)
      seen.P(-1,  1,  1)
      seen.P( 1, -1, -1)
      seen.P( 1, -1,  1)
      seen.P( 1,  1, -1)
      seen.P( 1,  1,  1)
    ]

    return new seen.Shape('cube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))

  # Returns a 1x1x1 cube from the origin to [1, 1, 1]
  unitcube: =>
    points = [
      seen.P(0, 0, 0)
      seen.P(0, 0, 1)
      seen.P(0, 1, 0)
      seen.P(0, 1, 1)
      seen.P(1, 0, 0)
      seen.P(1, 0, 1)
      seen.P(1, 1, 0)
      seen.P(1, 1, 1)
    ]

    return new seen.Shape('unitcube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))

  # Returns an axis-aligned 3D rectangle whose boundaries are defined by the two supplied points
  rectangle : (point1, point2) =>
    compose = (x, y, z) ->
      return seen.P(
        x(point1.x, point2.x)
        y(point1.y, point2.y)
        z(point1.z, point2.z)
      )

    points = [
      compose(Math.min, Math.min, Math.min)
      compose(Math.min, Math.min, Math.max)
      compose(Math.min, Math.max, Math.min)
      compose(Math.min, Math.max, Math.max)
      compose(Math.max, Math.min, Math.min)
      compose(Math.max, Math.min, Math.max)
      compose(Math.max, Math.max, Math.min)
      compose(Math.max, Math.max, Math.max)
    ]

    return new seen.Shape('rect', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))

  # Returns a tetrahedron that fits inside a 2x2x2 cube.
  tetrahedron: =>
    points = [
      seen.P( 1,  1,  1)
      seen.P(-1, -1,  1)
      seen.P(-1,  1, -1)
      seen.P( 1, -1, -1)]

    coordinateMap = [
      [0,2,1]
      [0,1,3]
      [3,2,0]
      [1,2,3]]

    return new seen.Shape('tetrahedron', seen.Shapes._mapPointsToSurfaces(points, coordinateMap))

  # Returns a planar triangular patch. The supplied arguments determine the number of triangle in the patch.
  patch: (nx = 20, ny = 20) ->
    nx = Math.round(nx)
    ny = Math.round(ny)
    surfaces = []
    for x in [0...nx]
      column = []
      for y in [0...ny]
        pts0 = [
          seen.P(x, y)
          seen.P(x + 1, y - 0.5)
          seen.P(x + 1, y + 0.5)
        ]
        pts1 = [
          seen.P(x, y)
          seen.P(x + 1, y + 0.5)
          seen.P(x, y + 1) 
        ]

        for pts in [pts0, pts1]
          for p in pts
            p.x *= EQUILATERAL_TRIANGLE_ALTITUDE
            p.y += if x % 2 is 0 then 0.5 else 0
          column.push pts

      if x % 2 isnt 0
        for p in column[0]
          p.y += ny
        column.push column.shift()
      surfaces = surfaces.concat(column)

    return new seen.Shape('patch', surfaces.map((s) -> new seen.Surface(s)))

  # Returns an icosahedron that fits within a 2x2x2 cube, centered on the origin
  icosahedron : ->
    return new seen.Shape('icosahedron', seen.Shapes._mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP))

  # Returns a sub-divided icosahedron, which approximates a sphere with triangles of equal size.
  sphere : (subdivisions = 2) ->
    triangles = ICOSAHEDRON_COORDINATE_MAP.map (coords) -> coords.map (c) -> ICOSAHEDRON_POINTS[c]
    for i in [0...subdivisions]
      triangles = seen.Shapes._subdivideTriangles(triangles)
    return new seen.Shape('sphere', triangles.map (triangle) -> new seen.Surface(triangle.map (v) -> v.copy()))

  # Return a text surface that can render 3D text when using an orthographic projection
  text: (text) ->
    surface = new seen.Surface([
      seen.P(0,  0, 0)
      seen.P(20, 0, 0)
      seen.P(0, 20, 0)
    ], seen.Painters.text)
    surface.text = text
    return new seen.Shape('text', [surface])

  # Returns a shape that is an extrusion of the supplied points into the z axis.
  extrude : (points, distance = 1) ->
    surfaces = []
    front = new seen.Surface (p.copy() for p in points)
    back  = new seen.Surface (p.translate(0,0,distance) for p in points)

    for i in [1...points.length]
      surfaces.push new seen.Surface [
        front.points[i - 1].copy()
        back.points[i - 1].copy()
        back.points[i].copy()
        front.points[i].copy()
      ]

    len = points.length
    surfaces.push new seen.Surface [
      front.points[len - 1].copy()
      back.points[len - 1].copy()
      back.points[0].copy()
      front.points[0].copy()
    ]

    back.points.reverse()
    surfaces.push front
    surfaces.push back
    return new seen.Shape('extrusion', surfaces)

  # Returns an extruded block arrow shape.
  arrow : (thickness = 1, tailLength = 1, tailWidth = 1, headLength = 1, headPointiness = 0) ->
    htw = tailWidth/2
    points = [
      seen.P(0, 0, 0)
      seen.P(headLength + headPointiness, 1, 0)
      seen.P(headLength, htw, 0)
      seen.P(headLength + tailLength, htw, 0)
      seen.P(headLength + tailLength, -htw, 0)
      seen.P(headLength, -htw, 0)
      seen.P(headLength + headPointiness, -1, 0)
    ]
    return seen.Shapes.extrude(points, thickness)

  # Returns a shape with a single surface using the supplied points array 
  path : (points) ->
    return new seen.Shape('path', [new seen.Surface(points)])

  custom: (s) ->
    surfaces = []
    for f in s.surfaces
      surfaces.push new seen.Surface((seen.P(p...) for p in f))
    return new seen.Shape('custom', surfaces)
}


# Parser for Wavefront .obj files
# 
# Note: Wavefront .obj array indicies are 1-based.
class seen.ObjParser
  constructor : () ->
    @vertices = []
    @faces    = []
    @commands =
      v : (data) => @vertices.push data.map (d) -> parseFloat(d)
      f : (data) => @faces.push data.map (d) -> parseInt(d)

  parse : (contents) ->
    for line in contents.split(/[\r\n]+/)
      data = line.trim().split(/[ ]+/)

      # Check data
      if data.length < 2
        continue

      command = data.slice(0,1)[0]
      data    = data.slice(1)

      # Check command
      if command.charAt(0) is '#'
        continue
      if not @commands[command]?
        console.log "OBJ Parser: Skipping unknown command '#{command}'"
        continue

      # Execute command
      @commands[command](data)

  mapFacePoints : (faceMap) ->
    @faces.map (face) =>
      points = face.map (v) => seen.P(@vertices[v - 1]...)
      return faceMap.call(@, points)

# This method accepts Wavefront .obj file content and returns a `Shape` object.
seen.Shapes.obj = (objContents, cullBackfaces = true) ->
  parser = new seen.ObjParser()
  parser.parse(objContents)
  return new seen.Shape('obj', parser.mapFacePoints((points) ->
    surface = new seen.Surface points
    surface.cullBackfaces = cullBackfaces
    return surface
  ))


# ## Animator
# ------------------

# The animator class is useful for creating a render loop.
# We supply pre and post render events for apply animation changes between renders.
class seen.Animator
  constructor : () ->
    @dispatch = seen.Events.dispatch('beforeRender', 'afterRender', 'render')
    @on       = @dispatch.on
    @_running = false

  # Start the render loop. The delay between frames can be supplied as an argument.
  start: (msecDelay = 30) ->
    @_running   = true
    @_msecDelay = msecDelay
    setTimeout(@render, @_msecDelay)
    return @

  # Stop the render loop.
  stop : ->
    @_running = false
    return @

  # The main render loop method
  render: () =>
    return unless @_running
    @dispatch.beforeRender()
    @dispatch.render()
    @dispatch.afterRender()
    setTimeout(@render, @_msecDelay)
    return @

  # Add a callback that will be invoked before the render
  onBefore : (handler) ->
    @on "beforeRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a callback that will be invoked after the render
  onAfter : (handler) ->
    @on "afterRender.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a render callback
  onRender : (handler) ->
    @on "render.#{seen.Util.uniqueId('animator-')}", handler
    return @


# ## Camera
# #### Projections, Viewports, and Cameras
# ------------------

# These projection methods return a 3D to 2D `Matrix` transformation.
# Each projection assumes the camera is located at (0,0,0).
seen.Projections = {
  # Creates a perspective projection matrix 
  perspectiveFov : (fovyInDegrees = 50, front = 1) ->
    tan = front * Math.tan(fovyInDegrees * Math.PI / 360.0)
    return seen.Projections.perspective(-tan, tan, -tan, tan, front, 2*front)

  # Creates a perspective projection matrix with the supplied frustrum
  perspective : (left=-1, right=1, bottom=-1, top=1, near=1, far=100) ->
    near2 = 2 * near
    dx    = right - left
    dy    = top - bottom
    dz    = far - near

    m = new Array(16)
    m[0]  = near2 / dx
    m[1]  = 0.0
    m[2]  = (right + left) / dx
    m[3]  = 0.0

    m[4]  = 0.0
    m[5]  = near2 / dy
    m[6]  = (top + bottom) / dy
    m[7]  = 0.0

    m[8]  = 0.0
    m[9]  = 0.0
    m[10] = -(far + near) / dz
    m[11] = -(far * near2) / dz

    m[12] = 0.0
    m[13] = 0.0
    m[14] = -1.0
    m[15] = 0.0
    return seen.M(m)

  ortho : (left=-1, right=1, bottom=-1, top=1, near=1, far=100) ->
    near2 = 2 * near
    dx    = right - left
    dy    = top - bottom
    dz    = far - near

    m = new Array(16)
    m[0]  = 2 / dx
    m[1]  = 0.0
    m[2]  = 0.0
    m[3]  = (right + left) / dx

    m[4]  = 0.0
    m[5]  = 2 / dy
    m[6]  = 0.0
    m[7]  = -(top + bottom) / dy

    m[8]  = 0.0
    m[9]  = 0.0
    m[10] = -2 / dz
    m[11] = -(far + near) / dz

    m[12] = 0.0
    m[13] = 0.0
    m[14] = 0.0
    m[15] = 1.0
    return seen.M(m)
}

seen.Viewports = {
  center : (width = 500, height = 500, x = 0, y = 0) ->
    prescale = seen.M()
      .translate(-x, -y, -1)
      .scale(1/width, 1/height, 1/height)
    postscale = seen.M()
      .scale(width, -height, height)
      .translate(x + width/2, y + height/2)
    return {prescale, postscale}

  origin : (width = 500, height = 500, x = 0, y = 0) ->
    prescale = seen.M()
      .translate(-x, -y, -1)
      .scale(1/width, 1/height, 1/height)
    postscale = seen.M()
      .scale(width, -height, height)
      .translate(x, y)
    return {prescale, postscale}
}

# The `Camera` model contains all three major components of the 3D to 2D tranformation.
# 
# First, we transform object from world-space (the same space that the coordinates of
# surface points are in after all their transforms are applied) to camera space. Typically,
# this will place all viewable objects into a cube with coordinates:
# x = -1 to 1, y = -1 to 1, z = 1 to 2
# 
# Second, we apply the projection trasform to create perspective parallax and what not.
#
# Finally, we rescale to the viewport size.
#
# These three steps allow us to easily create shapes whose coordinates match up to
# screen coordinates in the z = 0 plane.
class seen.Camera
  defaults :
    projection : seen.Projections.perspective()
    viewport   : seen.Viewports.center()
    camera     : seen.Matrices.identity()

  constructor : (options) ->
    seen.Util.defaults(@, options, @defaults)

  # Performs the 3-step multiplication of the transformation matrices.
  getMatrix : ->
    @camera.copy().multiply(@viewport.prescale).multiply(@projection).multiply(@viewport.postscale)



# ## The Scene
# ------------------

# A `Scene` is the main object for a view of a scene.
class seen.Scene
  defaults:
    # The root model for the scene, which contains `Shape`s and `Light`s
    model            : new seen.Model()
    # `Camera` which defines the projection from shape-space to screen-space.
    camera           : new seen.Camera()
    # The scene's shader determines which lighting model is used.
    shader           : seen.Shaders.phong
    # This boolean can be used to turn off backface-culling for the whole
    # scene. Beware, turning this off can slow down a scene's rendering
    # by a factor of 2. You can also turn off backface-culling for
    # individual surfaces with a boolean on those objects.
    cullBackfaces    : true
    # This boolean determines if we round the surface coordinates to the
    # nearest integer. Rounding the coordinates before display speeds up
    # path drawing at the cost of a slight jittering effect when animating.
    # Anecdotally, my speedup on a complex demo scene was 10 FPS
    fractionalPoints : false

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)
    @_renderModelCache = {}

  # The primary method that produces the render models, which are then used
  # by the `RenderContext` to paint the scene.
  render : () =>
    # Compute the projection matrix.
    projection = @camera.getMatrix()

    renderModels = []
    @model.eachRenderable(
      (light, transform) ->
        # Compute light model data.
        new seen.LightRenderModel(light, transform)

      (shape, lights, transform) =>
        for surface in shape.surfaces
          # Compute transformed and projected geometry.
          renderModel = @_renderSurface(surface, transform, projection)

          # Test projected normal's z-coordinate for culling (if enabled).
          if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0)
            # Render fill and stroke using material and shader.
            renderModel.fill   = surface.fill?.render(lights, @shader, renderModel.transformed)
            renderModel.stroke = surface.stroke?.render(lights, @shader, renderModel.transformed)

            # Round coordinates
            if @fractionalPoints isnt true
              p.round() for p in renderModel.projected.points

            renderModels.push renderModel
    )

    # Sort render models by projected z coordinate. This ensures that the surfaces
    # farthest from the eye are painted first. (Painter's Algorithm)
    renderModels.sort (a, b) ->
      return  b.projected.barycenter.z - a.projected.barycenter.z

    return renderModels

  # Get or create the rendermodel for the given surface. We cache these models to reduce object creation.
  _renderSurface : (surface, transform, projection) ->
    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

  flush : () =>
    @_renderModelCache = {}

