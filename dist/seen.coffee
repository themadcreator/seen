

# ## MIT License
# 
#   Copyright (c) 2013 github/themadcreator
# 
#   Permission is hereby granted, free of charge, to any person
#   obtaining a copy of this software and associated documentation
#   files (the "Software"), to deal in the Software without
#   restriction, including without limitation the rights to use,
#   copy, modify, merge, publish, distribute, sublicense, and/or sell
#   copies of the Software, and to permit persons to whom the
#   Software is furnished to do so, subject to the following
#   conditions:
# 
#   The above copyright notice and this permission notice shall be
#   included in all copies or substantial portions of the Software.
# 
#   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
#   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
#   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
#   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
#   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
#   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
#   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
#   OTHER DEALINGS IN THE SOFTWARE.
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
  uniqueId: () ->
    return NEXT_UNIQUE_ID++
}


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

  # Desctructively resets the matrix to the identity matrix.
  reset: ->
    @m = IDENTITY.slice()
    return @

  # Non-destructively multiply by the Matrix argument, returning a new `Matrix` object.
  multiply: (b) ->
    return @copy()._multiply(b)

  # Non-destructively multiply by the 16-value Array argument, returning a new `Matrix` object.
  multiplyM: (m) ->
    return @copy()._multiplyM(m)

  # Non-destructively apply a rotation about the X axis, returning a new `Matrix` object. `Theta` is measured in Radians
  rotx: (theta) ->
    return @copy()._rotx(theta)

  # Non-destructively apply a rotation about the Y axis, returning a new `Matrix` object. `Theta` is measured in Radians
  roty: (theta) ->
    return @copy()._roty(theta)

  # Non-destructively apply a rotation about the Z axis, returning a new `Matrix` object. `Theta` is measured in Radians
  rotz: (theta) ->
    return @copy()._rotz(theta)

  # Non-destructively apply a translation, returning a new `Matrix` object.
  translate: (x,y,z) ->
    return @copy()._translate(x,y,z)

  # Non-destructively apply a scale, returning a new `Matrix` object.
  scale: (sx,sy,sz) ->
    return @copy()._scale(sx,sy,sx)

  # Destructively multiply by the `Matrix` argument.
  _multiply: (b) ->
    return @_multiplyM(b.m)

  # Destructively multiply by the 16-value `Array` argument. This method uses the `ARRAY_POOL`, which prevents us from having to re-initialize a new temporary matrix every time. This drastically improves performance.
  _multiplyM: (m) ->
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

  # Destructively apply a rotation about the X axis. `Theta` is measured in Radians
  _rotx: (theta) -> 
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ 1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1 ]
    return @_multiplyM(rm)

  # Destructively apply a rotation about the Y axis. `Theta` is measured in Radians
  _roty: (theta)  ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1 ]
    return @_multiplyM(rm)

  # Destructively apply a rotation about the Z axis. `Theta` is measured in Radians
  _rotz: (theta) ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
    return @_multiplyM(rm)

  # Destructively apply a translation. All arguments default to `0`
  _translate: (x = 0, y = 0, z = 0) ->
    @m[3]  += x
    @m[7]  += y
    @m[11] += z
    return @

  # Destructively apply a scale. If not all arguments are supplied, each dimension (x,y,z) is copied from the previous arugment. Therefore, `_scale()` is equivalent to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  _scale: (sx = 1, sy, sz) ->
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
  identity : seen.M()
  flipX    : seen.M().scale(-1, 1, 1)
  flipY    : seen.M().scale( 1,-1, 1)
  flipZ    : seen.M().scale( 1, 1,-1)
}

# `Transformable` base class extended by `Shape` and `Group`.
# 
# The advantages of keeping transforms in `Matrix` form are (1) lazy computation of point position (2) ability combine hierarchical transformations easily (3) ability to reset transformations to an original state.
# 
# Resetting transformations is especially useful when you want to animate interpolated values. Instead of computing the difference at each animation step, you can compute the global interpolated value for that time step and apply that value directly to a matrix (once it is reset).
class seen.Transformable
  constructor: ->
    @m = new seen.Matrix()

  # Apply a scale. see `Matrix._scale`
  scale: (sx, sy, sz) ->
    @m._scale(sx, sy, sz)
    return @

  # Apply a translation. see `Matrix._translate`
  translate: (x, y, z) ->
    @m._translate(x,y,z)
    return @

  # Apply a rotation about the X axis in Radians. see `Matrix._rotx`
  rotx: (theta) ->
    @m._rotx(theta)
    return @

  # Apply a rotation about the Y axis in Radians. see `Matrix._roty`
  roty: (theta) ->
    @m._roty(theta)
    return @

  # Apply a rotation about the Z axis in Radians. see `Matrix._rotz`
  rotz: (theta) ->
    @m._rotz(theta)
    return @

  # Apply a transformation from the supplied 16-value `Array`. see `Matrix._multiplyM`
  matrix: (m) ->
    @m._multiplyM(m)
    return @

  # Apply a transformation from the supplied `Matrix`. see `Matrix._multiply`
  transform: (m) ->
    @m._multiply(m)
    return @

  # Resets the transformation.
  reset: () ->
    @m.reset()
    return @

# The `Point` object contains x,y,z, and w coordinates. `Points` support various arithmetic operations with other `Points`, scalars, or `Matrices`.
#
# Similar to the `Matrix` object. `Point` objects have **non-destructive** (e.g. `add`) methods, which return a new `Point` without modifying the current object, and **destrcutive** (e.g. `_add`) methods which modify the object.
class seen.Point
  constructor: (@x = 0, @y = 0, @z = 0, @w = 1) ->

  # Apply a transformation from the supplied `Matrix`.
  transform: (matrix) ->
    r = POINT_POOL
    r.x = @x * matrix.m[0] + @y * matrix.m[1] + @z * matrix.m[2] + @w * matrix.m[3]
    r.y = @x * matrix.m[4] + @y * matrix.m[5] + @z * matrix.m[6] + @w * matrix.m[7]
    r.z = @x * matrix.m[8] + @y * matrix.m[9] + @z * matrix.m[10] + @w * matrix.m[11]
    r.w = @x * matrix.m[12] + @y * matrix.m[13] + @z * matrix.m[14] + @w * matrix.m[15]
  
    @set(r)
    return @

  # Copies the values of the supplied `Point` into this object.
  set: (p) ->
    @x = p.x
    @y = p.y
    @z = p.z
    @w = p.w
    return @
  
  # Creates and returns a new `Point` with the same values as this object.
  copy: () ->
    return new Point(@x, @y, @z, @w)

  # Non-destructively scales this `Point` by its magnitude.
  normalize: () ->
    return @copy()._normalize()

  # Non-destructively performs parameter-wise addition with the supplied `Point`.
  add: (q) ->
    return @copy()._add(q)

  # Non-destructively performs parameter-wise subtraction with the supplied `Point`.
  subtract: (q) ->
    return @copy()._subtract(q)

  # Non-destructively computes the cross product with the supplied `Point`.
  cross: (q) ->
    return @copy()._cross(q)

  # Computes the dot product with the supplied `Point`.
  dot: (q) ->
    return @x * q.x + @y * q.y + @z * q.z

  # Non-destructively multiplies each parameters by the supplied scalar value.
  multiply: (n) ->
    return @copy()._multiply(n)

  # Non-destructively divides each parameters by the supplied scalar value.
  divide: (n) ->
    return @copy()._divide(n)

  # Destructively multiplies each parameters by the supplied scalar value.
  _multiply: (n) ->
    @x *= n
    @y *= n
    @z *= n
    return @

  # Destructively divides each parameters by the supplied scalar value.
  _divide: (n) ->
    @x /= n
    @y /= n
    @z /= n
    return @

  # Destructively scales this `Point` by its magnitude.
  _normalize: () ->
    n = Math.sqrt(@dot(@))
    if n == 0
      @set(Points.Z)
    else
      @_divide(n)
    return @

  # Destructively performs parameter-wise addition with the supplied `Point`.
  _add: (q) ->
    @x += q.x
    @y += q.y
    @z += q.z
    return @

  # Destructively performs parameter-wise subtraction with the supplied `Point`.
  _subtract: (q) ->
    @x -= q.x
    @y -= q.y
    @z -= q.z
    return @

  # Destructively computes the cross product with the supplied `Point`.
  _cross: (q) ->
    r = POINT_POOL
    r.x = @y * q.z - @z * q.y
    r.y = @z * q.x - @x * q.z
    r.z = @x * q.y - @y * q.x

    @set(r)
    return @

  toJSON: () ->
    return [@x, @y, @z, @w]

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



# ## Materials
# #### Colors and surface material properties used by shaders.
# ------------------

# `Color` objects store RGB and Alpha values from 0 to 255.
class seen.Color
  constructor: (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

  # Returns a new `Color` object with the same rgb and alpha values as the current object
  copy: () ->
    return new seen.Color(@r, @g, @b, @a)

  scale: (n) ->
    return @copy()._scale(n)

  offset: (n) ->
    return @copy()._offset(c)

  clamp: (min, max) ->
    return @copy()._clamp(min, max)

  addChannels: (c) ->
    return @copy()._addChannels(c)

  multiplyChannels: (c) ->
    return @copy()._multiplyChannels(c)

  # Scales the rgb channels by the supplied scalar value.
  _scale: (n) ->
    @r *= n
    @g *= n
    @b *= n
    return @

  # Offsets each rgb channel by the supplied scalar value.
  _offset: (n) ->
    @r += n
    @g += n
    @b += n
    return @

  # Clamps each rgb channel to the supplied minimum and maximum scalar values.
  _clamp: (min = 0, max = 0xFF) ->
    @r = Math.min(max, Math.max(min, @r))
    @g = Math.min(max, Math.max(min, @g))
    @b = Math.min(max, Math.max(min, @b))
    return @

  # Adds the channels of the current `Color` with each respective channel from the supplied `Color` object.
  _addChannels: (c) ->
    @r += c.r
    @g += c.g
    @b += c.b
    return @

  # Multiplies the channels of the current `Color` with each respective channel from the supplied `Color` object.
  _multiplyChannels: (c) ->
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
  rgb: (r, g, b, a) ->
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
  hsl: (h, s, l) ->
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

    return new seen.Color(r * 255, g * 255, b * 255)
}

# Shorten name of `Colors` object for convenience.
seen.C = seen.Colors

# A few `Color`s are supplied for convenience.
seen.C.black = seen.C.hex('#000000')
seen.C.white = seen.C.hex('#FFFFFF')
seen.C.gray  = seen.C.hex('#888888')

# `Material` objects hold the attributes that desribe the color and finish of a surface.
class seen.Material
  defaults : 
    # The base color of the material
    color            : seen.C.gray
    # The `metallic` attribute determines how the specular highlights are calculated. Normally, specular highlights are the color of the light source. If metallic is true, specular highlight colors are determined from the `specularColor` attribute.
    metallic         : false
    # The color used for specular highlights when `metallic` is true
    specularColor    : seen.C.white
    # The `specularExponent` determines how "shiny" the material is. A low exponent will create a low-intesity, diffuse specular shine. A high exponent will create an intense, point-like specular shine.
    specularExponent : 8
    # A `Shader` object may be supplied to override the shader used for this material. For example, if you want to apply a flat color to text or other shapes, set this value to `seen.Shaders.Flat`.
    shader           : null

  constructor : (@color) ->
    seen.Util.defaults(@, {}, @defaults)

  # Apply the shader's shading to this material, with the option to override the shader with the material's shader (if defined).
  render : (lights, shader, renderData) ->
    renderShader = @shader ? shader
    return renderShader.shade(lights, renderData, @)


# ## Lighting
# #### Lights and various shaders
# ------------------


# This model object holds the attributes and transformation of a light source.
class seen.Light extends seen.Transformable
  constructor: (opts) ->
    seen.Util.defaults(@, opts,
        point     : seen.P()
        color     : seen.C.white
        intensity : 0.01
      )

  render : ->
    @colorIntensity = @color.scale(@intensity)
  
  transform: (m) =>
    @point.transform(m)

# The `Shader` class is the base class for all shader objects.
class seen.Shader
  # Every `Shader` implementation must override the `shade` method.
  # 
  # `lights` is an object containing the ambient, point, and directional light sources.
  # `renderData` is an instance of `RenderSurface` and contains the transformed and projected surface data.
  # `material` is an instance of `Material` and contains the color and other attributes for determining how light reflects off the surface.
  shade: (lights, renderData, material) ->
    # Override this

# The `Phong` shader implements the Phong shading model with a diffuse, specular, and ambient term.
#
# See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
class Phong extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      # diffuse and specular
      if (dot > 0)
        c._addChannels(light.colorIntensity.scale(dot))

        Rm                = renderData.normal.multiply(dot * 2).subtract(Lm)
        specularIntensity = Math.pow(1 + Rm.dot(seen.Points.Z), material.specularExponent)
        # TODO scale by specular color from material if available
        # specularColor     = seen.C.white #material.specularColor ? seen.C.white
        # c._addChannels(specularColor.scale(specularIntensity * light.intensity))
        c._offset(specularIntensity * light.intensity)

    for light in lights.ambients
      # ambient
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `DiffusePhong` shader implements the Phong shading model with a diffuse and ambient term (no specular).
class DiffusePhong extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      # diffuse
      if (dot > 0)
        c._addChannels(light.colorIntensity.scale(dot))

    # ambient
    for light in lights.ambients
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `Ambient` shader colors surfaces from ambient light only.
class Ambient extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    # ambient
    for light in lights.ambients
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `Flat` shader colors surfaces with the material color, disregarding all light sources.
class Flat extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    return material.color

seen.Shaders = {
  phong   : new Phong()
  diffuse : new DiffusePhong()
  ambient : new Ambient()
  flat    : new Flat()
}



# ## Geometry
# #### Groups, shapes, surfaces, and render data
# ------------------

# The `RenderSurface` object contains the transformed and projected points as well as various data
# needed to render scene shapes.
#
# Once initialized, the object will have a constant memory footprint
# down to `Number` primitives. Also, we compare each transform and projection
# to prevent unnecessary re-computation.
class seen.RenderSurface
  constructor: (@points, @transform, @projection) ->
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection) ->
    if seen.Util.arraysEqual(transform.m, @transform.m) and seen.Util.arraysEqual(projection.m, @projection.m)
      return
    else
      @transform = transform
      @projection = projection
      @_update()

  _update: () ->
    @_math(@transformed, @points, @transform, false)
    @_math(@projected, @transformed.points, @projection, true)

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
      if applyClip then sp._divide(sp.w)

    # Compute barycenter, which is used in aligning shapes in the painters algorithm
    set.barycenter.set(seen.Points.ZERO)
    for p in set.points
      set.barycenter._add(p)
    set.barycenter._divide(set.points.length)

    # Compute normal, which is used for backface culling (when enabled)
    set.v0.set(set.points[1])._subtract(set.points[0])
    set.v1.set(set.points[points.length - 1])._subtract(set.points[0])
    set.normal.set(set.v0._cross(set.v1)._normalize())

class seen.Surface
  cullBackfaces : true
  fill          : new seen.Material(seen.C.gray)
  stroke        : null

  # TODO change to options constructor with defaults
  constructor: (@points, @painter = seen.Painters.path) ->
    @id = 's' + seen.Util.uniqueId()

class seen.Shape extends seen.Transformable
  constructor: (@type, @surfaces) ->
    super()

  eachSurface: (f) ->
    @surfaces.forEach(f)
    return @

  fill: (fill) ->
    @eachSurface (s) -> s.fill = fill
    return @

  stroke: (stroke) ->
    @eachSurface (s) -> s.stroke = stroke
    return @

class seen.Group extends seen.Transformable
  constructor: () ->
    super()
    @children = []

  add: (child) ->
    @children.push child
    return @

  append: () ->
    group = new seen.Group
    @add group
    return group

  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Group
        child.eachTransformedShape(f)

  eachTransformedShape: (f, m = null) ->
    m ?= @m
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child, child.m.multiply(m))
      if child instanceof seen.Group
        child.eachTransformedShape(f, child.m.multiply(m))



# ## Painters
# ------------------

class seen.Painter
  paint : (surface, canvas) ->
    # Override this

class PathPainter extends seen.Painter
  paint : (surface, canvas) ->
    render = surface.render
    canvas.path()
      .path(render.projected.points)
      .style(
        fill           : if not render.fill? then 'none' else render.fill.hex()
        stroke         : if not render.stroke? then 'none' else render.stroke.hex()
        'fill-opacity' : if not surface.fill? then 1.0 else (surface.fill.a / 0xFF)
        'stroke-width' : surface['stroke-width'] ? 1
      )

class TextPainter extends seen.Painter
  paint : (surface, canvas) ->
    render = surface.render
    canvas.text()
      .text(surface.text)
      .transform(render.transform.multiply render.projection)
      .style(
        fill          : if not render.fill? then 'none' else render.fill.hex()
        stroke        : if not render.stroke? then 'none' else render.stroke.hex()
        'text-anchor' : surface.anchor ? 'middle'
      )

seen.Painters = {
  path : new PathPainter()
  text : new TextPainter()
}


# ## Shapes
# #### Shape primitives and shape-making methods
# ------------------

seen.Shapes = {
  _cubeCoordinateMap : [
    [0,1,3,2] # left
    [5,4,6,7] # right
    [1,0,4,5] # bottom
    [2,3,7,6] # top
    [3,1,5,7] # front
    [0,2,6,4] # back
  ]

  _mapPointsToSurfaces: (points, coordinateMap) ->
    surfaces = []
    for coords in coordinateMap
      spts = (points[c].copy() for c in coords)
      surfaces.push(new seen.Surface(spts))
    return surfaces

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

  text: (text) ->
    surface = new seen.Surface([
      seen.P(0,0,-1)
      seen.P(0,20,-1)
      seen.P(20,0,-1)
    ], seen.Painters.text)
    surface.text = text
    surface.cullBackfaces = false
    return new seen.Shape('text', [surface])

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

  path : (points) ->
    return new seen.Shape('path', [new seen.Surface(points)])

  custom: (s) ->
    surfaces = []
    for f in s.surfaces
      surfaces.push new seen.Surface((seen.P(p...) for p in f))
    return new seen.Shape('custom', surfaces)
}

# ## Projections
# #### Projections and viewport tranformations.
# ------------------

seen.Projections = {
  perspectiveFov : (fovyInDegrees = 50, front = 100) ->
    tan = front * Math.tan(fovyInDegrees * Math.PI / 360.0)
    return seen.Projections.perspective(-tan, tan, -tan, tan, front, 2*front)

  orthoExtent : (extent = 100) ->
    return seen.Projections.ortho(-extent, extent, -extent, extent, extent, 2*extent)
  
  # Creates a perspective projection matrix assuming camera is at (0,0,0)
  perspective : (left, right, bottom, top, near, far) ->
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
    return new seen.Matrix(m)

  ortho : (left, right, bottom, top, near, far) ->
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
    return new seen.Matrix(m)
}

seen.Viewports = {
  centerOrigin : (width = 500, height = 500, x = 0, y = 0) ->
    return new seen.Matrix()
      .scale(width / 2, -height / 2)
      .translate(x + width / 2, y + height / 2)
}



_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

_line = d3.svg.line()
  .x((d) -> d.x)
  .y((d) -> d.y)

class seen.Renderer
  render: (surfaces) ->
    @reset()
    for surface in surfaces
      surface.painter.paint(surface, @)
    @hideUnused()

  path : ->
    # override should return a path renderer

  text : ->
    # override should return a text renderer

class seen.SvgRenderer extends seen.Renderer
  constructor : () ->
    @_i = 0

  addTo : (layer) ->
    @_g = layer

  path : () ->
    el = @_manifest('path')
    return {
      el    : el
      path  : (points) ->
        el.setAttribute('d', _line(points))
        return @
      style : (style) ->
        str = ''
        for key,val of style
          str += "#{key}:#{val};"
        el.setAttribute('style', str)
        return @
    }

  text : () ->
    el = @_manifest('text')
    el.setAttribute 'font-family', 'Roboto'
    return {
      el        : el
      text      : (text) ->
        el.textContent = text
        return @
      style     : (style) ->
        str = ''
        for key,val of style
          str += "#{key}:#{val};"
        el.setAttribute('style', str)
        return @
      transform : (transform) ->
        m = transform.m
        el.setAttribute('transform', "matrix(#{m[0]} #{m[4]} #{m[1]} #{m[5]} #{m[3]} #{m[7]})")
        return @
    }

  reset : ->
    @_i = 0

  hideUnused : ->
    children = @_g.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  _manifest : (type) ->
    children = @_g.childNodes
    if @_i >= children.length
      path = _svg(type)
      @_g.appendChild(path)
      @_i++
      return path

    current = children[@_i]
    if current.tagName is type
      @_i++
      return current
    else
      path = _svg(type)
      @_g.replaceChild(path, current)
      @_i++
      return path

class seen.SvgCanvas
  constructor: (@svg) ->
    @layers = {}

  layer : (name, component) ->
    layer = @layers[name] = _svg('g')
    @svg.appendChild(layer)
    if component?
      component.addTo layer
    return @

class seen.SvgRenderDebug
  constructor: (scene) ->
    @_text = _svg('text')
    @_text.setAttribute('style', 'text-anchor:end;')
    @_text.setAttribute('x', 500 - 10)
    @_text.setAttribute('y', '20')

    @_fps = 30
    scene.on 'beforeRender.debug', @_renderStart
    scene.on 'afterRender.debug', @_renderEnd

  addTo: (layer) ->
    layer.appendChild(@_text)

  _renderStart: =>
    @_renderStartTime = new Date()

  _renderEnd: (e) =>
    frameTime = 1000 / (new Date() - @_renderStartTime)
    if frameTime != NaN then @_fps += (frameTime - @_fps) / 20
    @_text.textContent = "fps: #{@_fps.toFixed(1)} surfaces: #{e.surfaces.length}"

class seen.SvgFillRect
  addTo: (layer) ->
    rect = _svg('rect')
    rect.setAttribute('fill', '#EEE')
    rect.setAttribute('width', 500)
    rect.setAttribute('height', 500)
    layer.appendChild(rect)


# ## The Scene
# ------------------

class seen.Scene
  defaults:
    cullBackfaces : true
    projection    : seen.Projections.perspective(-100, 100, -100, 100, 100, 300)
    viewport      : seen.Viewports.centerOrigin(500, 500)

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults)

    @dispatch = d3.dispatch('beforeRender', 'afterRender')
    d3.rebind(@, @dispatch, ['on'])

    @group  = new seen.Group()
    @shader = seen.Shaders.phong
    @lights =
      points   : []
      ambients : []
    @surfaces = []
    @renderModelCache = {}

  startRenderLoop: (msecDelay = 30) ->
    setInterval(@render, msecDelay)

  render: () =>
    @dispatch.beforeRender()
    surfaces = @_renderSurfaces()
    @renderer.render(surfaces)
    @dispatch.afterRender(surfaces : surfaces)
    return @
 
  _renderSurfaces: () =>
    # compute projection matrix
    projection = @projection.multiply(@viewport)

    # precompute light data
    for key, lights of @lights
      for light in lights
        light.render()

    # clear renderable surfaces array
    @surfaces.length = 0
    @group.eachTransformedShape (shape, transform) =>
      for surface in shape.surfaces
        # compute transformed and projected geometry
        render = surface.render = @_renderSurface(surface, transform, projection)

        # test for culling
        if (not @cullBackfaces or not surface.cullBackfaces or render.projected.normal.z < 0)
          # apply material shading
          render.fill   = surface.fill?.render(@lights, @shader, render.transformed)
          render.stroke = surface.stroke?.render(@lights, @shader, render.transformed)

          # add surface to renderable surfaces array
          @surfaces.push(surface)

    # sort for painter's algorithm
    @surfaces.sort (a, b) ->
      return  b.render.projected.barycenter.z - a.render.projected.barycenter.z

    return @surfaces

  _renderSurface : (surface, transform, projection) ->
    renderModel = @renderModelCache[surface.id]
    if not renderModel?
      renderModel = @renderModelCache[surface.id] = new seen.RenderSurface(surface.points, transform, projection)
    else
      renderModel.update(transform, projection)
    return renderModel

