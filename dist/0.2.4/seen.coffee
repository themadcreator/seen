

# ## Apache 2.0 License
# 
#     Copyright 2013, 2014 github/themadcreator
# 
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
# 

# ## Init
# #### Module definition
# ------------------

# Declare and attach seen namespace
seen = {}
if window? then window.seen = seen # for the web
if module?.exports? then module.exports = seen # for node

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


# Adapted from https://github.com/josephg/noisejs/blob/master/perlin.js

# This code was placed in the public domain by its original author,
# Stefan Gustavson. You may use it as you see fit, but
# attribution is appreciated.

class seen.Grad
  constructor : (@x, @y, @z) ->
  dot : (x, y, z) -> @x*x + @y*y + @z*z

grad3 = [
  new seen.Grad( 1, 1, 0)
  new seen.Grad(-1, 1, 0)
  new seen.Grad( 1,-1, 0)
  new seen.Grad(-1,-1, 0)
  new seen.Grad( 1, 0, 1)
  new seen.Grad(-1, 0, 1)
  new seen.Grad( 1, 0,-1)
  new seen.Grad(-1, 0,-1)
  new seen.Grad( 0, 1, 1)
  new seen.Grad( 0,-1, 1)
  new seen.Grad( 0, 1,-1)
  new seen.Grad( 0,-1,-1)
]

# To remove the need for index wrapping, double the permutation table length
SIMPLEX_PERMUTATIONS_TABLE = [151,160,137,91,90,15,
  131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
  190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
  88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
  77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
  102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
  135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
  5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
  223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
  129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
  251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
  49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
  138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]

F3 = 1 / 3
G3 = 1 / 6

class seen.Simplex3D
  constructor : (seed = 0) ->
    @perm  = new Array(512)
    @gradP = new Array(512)
    @seed(seed)

  # This isn't a very good seeding function, but it works ok. It supports 2^16
  # different seed values. Write something better if you need more seeds.
  seed : (seed) ->
    # Scale the seed out
    if(seed > 0 && seed < 1)
      seed *= 65536

    seed = Math.floor(seed)
    if(seed < 256)
      seed |= seed << 8

    for i in [0...256]
      v = 0
      if (i & 1)
        v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ (seed & 255)
      else
        v = SIMPLEX_PERMUTATIONS_TABLE[i] ^ ((seed>>8) & 255)

      @perm[i]  = @perm[i + 256]  = v
      @gradP[i] = @gradP[i + 256] = grad3[v % 12]

  noise : (x, y, z) ->
    # Skew the input space to determine which simplex cell we're in
    s = (x + y + z)*F3 # Hairy factor for 2D
    i = Math.floor(x + s)
    j = Math.floor(y + s)
    k = Math.floor(z + s)

    t  = (i + j + k) * G3
    x0 = x - i + t # The x,y distances from the cell origin, unskewed.
    y0 = y - j + t
    z0 = z - k + t

    # For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    # Determine which simplex we are in.
    # Offsets for second corner of simplex in (i,j,k) coords
    # Offsets for third corner of simplex in (i,j,k) coords
    if(x0 >= y0)
      if(y0 >= z0)
        i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;
      else if(x0 >= z0)
        i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;
      else
        i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;
    else
      if(y0 < z0)
        i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;
      else if(x0 < z0)
        i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;
      else
        i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;

    # A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    # a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    # a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    # c = 1/6.
    x1 = x0 - i1 + G3 # Offsets for second corner
    y1 = y0 - j1 + G3
    z1 = z0 - k1 + G3

    x2 = x0 - i2 + 2 * G3 # Offsets for third corner
    y2 = y0 - j2 + 2 * G3
    z2 = z0 - k2 + 2 * G3

    x3 = x0 - 1 + 3 * G3 # Offsets for fourth corner
    y3 = y0 - 1 + 3 * G3
    z3 = z0 - 1 + 3 * G3

    # Work out the hashed gradient indices of the four simplex corners
    i &= 0xFF
    j &= 0xFF
    k &= 0xFF
    gi0 = @gradP[i +      @perm[j +      @perm[k]]]
    gi1 = @gradP[i + i1 + @perm[j + j1 + @perm[k + k1]]]
    gi2 = @gradP[i + i2 + @perm[j + j2 + @perm[k + k2]]]
    gi3 = @gradP[i + 1  + @perm[j + 1  + @perm[k + 1]]]

    # Calculate the contribution from the four corners
    t0 = 0.5 - x0*x0-y0*y0-z0*z0
    if(t0<0)
      n0 = 0
    else
      t0 *= t0
      n0 = t0 * t0 * gi0.dot(x0, y0, z0)  # (x,y) of grad3 used for 2D gradient

    t1 = 0.5 - x1*x1-y1*y1-z1*z1
    if(t1<0)
      n1 = 0
    else
      t1 *= t1
      n1 = t1 * t1 * gi1.dot(x1, y1, z1)

    t2 = 0.5 - x2*x2-y2*y2-z2*z2
    if(t2<0)
      n2 = 0
    else
      t2 *= t2
      n2 = t2 * t2 * gi2.dot(x2, y2, z2)

    t3 = 0.5 - x3*x3-y3*y3-z3*z3
    if(t3<0)
      n3 = 0
    else
      t3 *= t3
      n3 = t3 * t3 * gi3.dot(x3, y3, z3)

    # Add contributions from each corner to get the final noise value.
    # The result is scaled to return values in the interval [-1,1].
    return 32 * (n0 + n1 + n2 + n3)


# ## Events
# ------------------

# Attribution: these have been adapted from d3.js's event dispatcher
# functions.

seen.Events = {
  # Return a new dispatcher that creates event types using the supplied string
  # argument list. The returned `Dispatcher` will have methods with the names
  # of the event types.
  dispatch : () ->
    dispatch = new seen.Events.Dispatcher()
    for arg in arguments
      dispatch[arg] = seen.Events.Event()
    return dispatch
}

# The `Dispatcher` class. These objects have methods that can be invoked like
# `dispatch.eventName()`. Listeners can be registered with
# `dispatch.on('eventName.uniqueId', callback)`. Listeners can be removed with
# `dispatch.on('eventName.uniqueId', null)`. Listeners can also be registered
# and removed with `dispatch.eventName.on('name', callback)`.
#
# Note that only one listener with the name event name and id can be
# registered at once. If you to generate unique ids, you can use the
# seen.Util.uniqueId() method.
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

# Internal event object for storing listener callbacks and a map for easy
# lookup. This method returns a new event object.
seen.Events.Event = ->

  # Invokes all of the listeners using the supplied arguments.
  event = ->
    for name, l of event.listenerMap
      if l? then l.apply(@, arguments)

  # Stores listeners for this event
  event.listenerMap = {}

  # Connects a listener to the event, deleting any other listener with the
  # same name.
  event.on = (name, listener) ->
    delete event.listenerMap[name]
    if listener? then event.listenerMap[name] = listener

  return event



# ## Math
# #### Matrices, points, and other mathy stuff
# ------------------

# Pool object to speed computation and reduce object creation
ARRAY_POOL = new Array(16)

# Definition of identity matrix values
IDENTITY = [1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1]

# Indices with which to transpose the matrix array
TRANSPOSE_INDICES = [0,  4,  8, 12,
                     1,  5,  9, 13,
                     2,  6, 10, 14,
                     3,  7, 11, 15]



# The `Matrix` class stores transformations in the scene. These include:
# (1) Camera Projection and Viewport transformations.
# (2) Transformations of any `Transformable` type object, such as `Shape`s or `Model`s
#
# Most of the methods on `Matrix` are destructive, so be sure to use `.copy()`
# when you want to preserve an object's value.
class seen.Matrix
  # Accepts a 16-value `Array`, defaults to the identity matrix.
  constructor : (@m = null) ->
    @m ?= IDENTITY.slice()
    @baked = IDENTITY

  # Returns a new matrix instances with a copy of the value array
  copy : ->
    return new seen.Matrix(@m.slice())

  # Multiply by the 16-value `Array` argument. This method uses the
  # `ARRAY_POOL`, which prevents us from having to re-initialize a new
  # temporary matrix every time. This drastically improves performance.
  matrix : (m) ->
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

  # Resets the matrix to the baked-in (default: identity).
  reset : ->
    @m = @baked.slice()
    return @

  # Sets the array that this matrix will return to when calling `.reset()`.
  # With no arguments, it uses the current matrix state.
  bake : (m) ->
    @baked = (m ? @m).slice()
    return @

  # Multiply by the `Matrix` argument.
  multiply : (b) ->
    return @matrix(b.m)

  # Tranposes this matrix
  transpose : ->
    c = ARRAY_POOL
    for ti, i in TRANSPOSE_INDICES
      c[i] = @m[ti]
    ARRAY_POOL = @m
    @m = c
    return @

  # Apply a rotation about the X axis. `Theta` is measured in Radians
  rotx : (theta) ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ 1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a rotation about the Y axis. `Theta` is measured in Radians
  roty : (theta)  ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a rotation about the Z axis. `Theta` is measured in Radians
  rotz : (theta) ->
    ct = Math.cos(theta)
    st = Math.sin(theta)
    rm = [ ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a translation. All arguments default to `0`
  translate : (x = 0, y = 0, z = 0) ->
    rm = [ 1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1 ]
    return @matrix(rm)

  # Apply a scale. If not all arguments are supplied, each dimension (x,y,z)
  # is copied from the previous arugment. Therefore, `_scale()` is equivalent
  # to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  scale : (sx, sy, sz) ->
    sx ?= 1
    sy ?= sx
    sz ?= sy
    rm = [ sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, 0, 0, 0, 1 ]
    return @matrix(rm)


# A convenience method for constructing Matrix objects.
seen.M = (m) -> new seen.Matrix(m)

# A few useful Matrix objects.
seen.Matrices = {
  identity : -> seen.M()
  flipX    : -> seen.M().scale(-1, 1, 1)
  flipY    : -> seen.M().scale( 1,-1, 1)
  flipZ    : -> seen.M().scale( 1, 1,-1)
}






# `Transformable` base class extended by `Shape` and `Model`.
#
# The advantages of keeping transforms in `Matrix` form are (1) lazy
# computation of point position (2) ability combine hierarchical
# transformations easily (3) ability to reset transformations to an original
# state.
#
# Resetting transformations is especially useful when you want to animate
# interpolated values. Instead of computing the difference at each animation
# step, you can compute the global interpolated value for that time step and
# apply that value directly to a matrix (once it is reset).
class seen.Transformable
  constructor: ->
    @m = new seen.Matrix()
    @baked = IDENTITY

    # We create shims for all of the matrix transformation methods so they
    # have the same interface.
    for method in ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset', 'bake'] then do (method) =>
      @[method] = ->
        @m[method].call(@m, arguments...)
        return @

  # Apply a transformation from the supplied `Matrix`. see `Matrix.multiply`
  transform: (m) ->
    @m.multiply(m)
    return @


# The `Point` object contains x,y,z, and w coordinates. `Point`s support
# various arithmetic operations with other `Points`, scalars, or `Matrices`.
#
# Most of the methods on `Point` are destructive, so be sure to use `.copy()`
# when you want to preserve an object's value.
class seen.Point
  constructor : (@x = 0, @y = 0, @z = 0, @w = 1) ->

  # Creates and returns a new `Point` with the same values as this object.
  copy : () ->
    return new seen.Point(@x, @y, @z, @w)

  # Copies the values of the supplied `Point` into this object.
  set : (p) ->
    @x = p.x
    @y = p.y
    @z = p.z
    @w = p.w
    return @

  # Performs parameter-wise addition with the supplied `Point`. Excludes `@w`.
  add : (q) ->
    @x += q.x
    @y += q.y
    @z += q.z
    return @

  # Performs parameter-wise subtraction with the supplied `Point`. Excludes `@w`.
  subtract : (q) ->
    @x -= q.x
    @y -= q.y
    @z -= q.z
    return @

  # Apply a translation.  Excludes `@w`.
  translate: (x, y, z) ->
    @x += x
    @y += y
    @z += z
    return @

  # Multiplies each parameters by the supplied scalar value. Excludes `@w`.
  multiply : (n) ->
    @x *= n
    @y *= n
    @z *= n
    return @

  # Divides each parameters by the supplied scalar value. Excludes `@w`.
  divide : (n) ->
    @x /= n
    @y /= n
    @z /= n
    return @

  # Rounds each coordinate to the nearest integer. Excludes `@w`.
  round : () ->
    @x = Math.round(@x)
    @y = Math.round(@y)
    @z = Math.round(@z)
    return @

  # Divides this `Point` by its magnitude. If the point is (0,0,0) we return (0,0,1).
  normalize : () ->
    n = @magnitude()
    if n == 0 # Strict zero comparison -- may be worth using an epsilon
      @set(seen.Points.Z())
    else
      @divide(n)
    return @

  # Apply a transformation from the supplied `Matrix`.
  transform : (matrix) ->
    r = POINT_POOL
    r.x = @x * matrix.m[0]  + @y * matrix.m[1]  + @z * matrix.m[2]  + @w * matrix.m[3]
    r.y = @x * matrix.m[4]  + @y * matrix.m[5]  + @z * matrix.m[6]  + @w * matrix.m[7]
    r.z = @x * matrix.m[8]  + @y * matrix.m[9]  + @z * matrix.m[10] + @w * matrix.m[11]
    r.w = @x * matrix.m[12] + @y * matrix.m[13] + @z * matrix.m[14] + @w * matrix.m[15]

    @set(r)
    return @

  # Returns this `Point`s magnitude squared. Excludes `@w`.
  magnitudeSquared : () ->
    return @dot(@)

  # Returns this `Point`s magnitude. Excludes `@w`.
  magnitude : () ->
    return Math.sqrt(@magnitudeSquared())

  # Computes the dot product with the supplied `Point`.
  dot : (q) ->
    return @x * q.x + @y * q.y + @z * q.z

  # Computes the cross product with the supplied `Point`.
  cross : (q) ->
    r = POINT_POOL
    r.x = @y * q.z - @z * q.y
    r.y = @z * q.x - @x * q.z
    r.z = @x * q.y - @y * q.x

    @set(r)
    return @

# Convenience method for creating `Points`.
seen.P = (x,y,z,w) -> new seen.Point(x,y,z,w)

# A pool object which prevents us from having to create new `Point` objects
# for various calculations, which vastly improves performance.
POINT_POOL = seen.P()

# A few useful `Point` objects. Be sure that you don't invoke destructive
# methods on these objects.
seen.Points = {
  X    : -> seen.P(1, 0, 0)
  Y    : -> seen.P(0, 1, 0)
  Z    : -> seen.P(0, 0, 1)
  ZERO : -> seen.P(0, 0, 0)
}


# A Quaterionion class for computing quaterion multiplications. This creates
# more natural mouse rotations.
#
# Attribution: adapted from http://glprogramming.com/codedump/godecho/quaternion.html
class seen.Quaternion
  @pixelsPerRadian : 150

  # Convert the x and y pixel offsets into a rotation matrix
  @xyToTransform : (x, y) ->
    quatX = seen.Quaternion.pointAngle(seen.Points.Y(), x / seen.Quaternion.pixelsPerRadian)
    quatY = seen.Quaternion.pointAngle(seen.Points.X(), y / seen.Quaternion.pixelsPerRadian)
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


# The `Bounds` object contains an axis-aligned bounding box.
class seen.Bounds

  @points : (points) ->
    box = new seen.Bounds()
    box.add(p) for p in points
    return box

  @xywh : (x, y, w, h) ->
    return seen.Boundses.xyzwhd(x, y, 0, w, h, 0)

  @xyzwhd : (x, y, z, w, h, d) ->
    box = new seen.Bounds()
    box.add(seen.P(x, y, z))
    box.add(seen.P(x+w, y+h, z+d))
    return box

  constructor : () ->
    @min = null
    @max = null

  # Creates a copy of this box object with the same bounds
  copy : () ->
    box = new seen.Bounds()
    box.min = @min?.copy()
    box.max = @max?.copy()
    return box

  # Adds this point to the bounding box, extending it if necessary
  add : (p) ->
    if not (@min? and @max?)
      @min = p.copy()
      @max = p.copy()
    else
      @min.x = Math.min(@min.x, p.x)
      @min.y = Math.min(@min.y, p.y)
      @min.z = Math.min(@min.z, p.z)

      @max.x = Math.max(@max.x, p.x)
      @max.y = Math.max(@max.y, p.y)
      @max.z = Math.max(@max.z, p.z)
    return @

  # Returns true of this box contains at least one point
  valid : ->
    return (@min? and @max?)

  # Trims this box so that it results in the intersection of this box and the
  # supplied box.
  intersect : (box) ->
    if not @valid() or not box.valid()
      @min = null
      @max = null
    else
      @min = seen.P(
        Math.max(@min.x, box.min.x)
        Math.max(@min.y, box.min.y)
        Math.max(@min.z, box.min.z)
      )
      @max = seen.P(
        Math.min(@max.x, box.max.x)
        Math.min(@max.y, box.max.y)
        Math.min(@max.z, box.max.z)
      )
      if @min.x > @max.x or @min.y > @max.y or @min.z > @max.z
        @min = null
        @max = null
    return @


  # Pads the min and max of this box using the supplied x, y, and z
  pad : (x, y, z) ->
    if @valid()
      y ?= x
      z ?= y
      p  = seen.P(x,y,z)
      @min.subtract(p)
      @max.add(p)
    return @

  # Returns this bounding box to an empty state
  reset : () ->
    @min = null
    @max = null
    return @

  # Return true iff the point p lies within this bounding box. Points on the
  # edge of the box are included.
  contains : (p) ->
    if not @valid()
      return false
    else if @min.x > p.x or @max.x < p.x
      return false
    else if @min.y > p.y or @max.y < p.y
      return false
    else if @min.z > p.z or @max.z < p.z
      return false
    else
      return true

  # Returns the center of the box or zero if no points are in the box
  center : () ->
    return seen.P(
      @minX() + @width()/2
      @minY() + @height()/2
      @minZ() + @depth()/2
    )

  # Returns the width (x extent) of the box
  width  : () => @maxX() - @minX()

  # Returns the height (y extent) of the box
  height : () => @maxY() - @minY()

  # Returns the depth (z extent) of the box
  depth  : () => @maxZ() - @minZ()

  minX : () => return @min?.x ? 0
  minY : () => return @min?.y ? 0
  minZ : () => return @min?.z ? 0

  maxX : () => return @max?.x ? 0
  maxY : () => return @max?.y ? 0
  maxZ : () => return @max?.z ? 0


# ## Colors
# ------------------

# `Color` objects store RGB and Alpha values from 0 to 255.
class seen.Color
  constructor : (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

  # Returns a new `Color` object with the same rgb and alpha values as the current object
  copy : () ->
    return new seen.Color(@r, @g, @b, @a)

  # Scales the rgb channels by the supplied scalar value.
  scale : (n) ->
    @r *= n
    @g *= n
    @b *= n
    return @

  # Offsets each rgb channel by the supplied scalar value.
  offset : (n) ->
    @r += n
    @g += n
    @b += n
    return @

  # Clamps each rgb channel to the supplied minimum and maximum scalar values.
  clamp : (min = 0, max = 0xFF) ->
    @r = Math.min(max, Math.max(min, @r))
    @g = Math.min(max, Math.max(min, @g))
    @b = Math.min(max, Math.max(min, @b))
    return @

  # Takes the minimum between each channel of this `Color` and the supplied `Color` object.
  minChannels : (c) ->
    @r = Math.min(c.r, @r)
    @g = Math.min(c.g, @g)
    @b = Math.min(c.b, @b)
    return @

  # Adds the channels of the current `Color` with each respective channel from the supplied `Color` object.
  addChannels : (c) ->
    @r += c.r
    @g += c.g
    @b += c.b
    return @

  # Multiplies the channels of the current `Color` with each respective channel from the supplied `Color` object.
  multiplyChannels : (c) ->
    @r *= c.r
    @g *= c.g
    @b *= c.b
    return @

  # Converts the `Color` into a hex string of the form "#RRGGBB".
  hex : () ->
    c = (@r << 16 | @g << 8 | @b).toString(16)
    while (c.length < 6) then c = '0' + c
    return '#' + c

  # Converts the `Color` into a CSS-style string of the form "rgba(RR, GG, BB, AA)"
  style : () ->
    return "rgba(#{@r},#{@g},#{@b},#{@a})"

seen.Colors = {
  CSS_RGBA_STRING_REGEX : /rgb(a)?\(([0-9.]+),([0-9.]+),*([0-9.]+)(,([0-9.]+))?\)/

  # Parses a hex string starting with an octothorpe (#) or an rgb/rgba CSS
  # string. Note that the CSS rgba format uses a float value of 0-1.0 for
  # alpha, but seen uses an in from 0-255.
  parse : (str) ->
    if str.charAt(0) is '#' and str.length is 7
      return seen.Colors.hex(str)
    else if str.indexOf('rgb') is 0
      m = seen.Colors.CSS_RGBA_STRING_REGEX.exec(str)
      return seen.Colors.black() unless m?
      a = if m[6]? then Math.round(parseFloat(m[6]) * 0xFF) else undefined
      return new seen.Color(parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), a)
    else
      return seen.Colors.black()

  # Creates a new `Color` using the supplied rgb and alpha values.
  #
  # Each value must be in the range [0, 255] or, equivalently, [0x00, 0xFF].
  rgb : (r, g, b, a = 255) ->
    return new seen.Color(r, g, b, a)

  # Creates a new `Color` using the supplied hex string of the form "#RRGGBB".
  hex : (hex) ->
    hex = hex.substring(1) if (hex.charAt(0) is '#')
    return new seen.Color(
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16))

  # Creates a new `Color` using the supplied hue, saturation, and lightness
  # (HSL) values.
  #
  # Each value must be in the range [0.0, 1.0].
  hsl : (h, s, l, a = 1) ->
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

  # Generates a new random color for each surface of the supplied `Shape`.
  randomSurfaces : (shape, sat = 0.5, lit = 0.4) ->
    for surface in shape.surfaces
      surface.fill seen.Colors.hsl(Math.random(), sat, lit)

  # Generates a random hue then randomly drifts the hue for each surface of
  # the supplied `Shape`.
  randomSurfaces2 : (shape, drift = 0.03, sat = 0.5, lit = 0.4) ->
    hue = Math.random()
    for surface in shape.surfaces
      hue += (Math.random() - 0.5) * drift
      while hue < 0 then hue += 1
      while hue > 1 then hue -= 1
      surface.fill seen.Colors.hsl(hue, 0.5, 0.4)

  # Generates a random color then sets the fill for every surface of the
  # supplied `Shape`.
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
# #### Surface material properties
# ------------------


# `Material` objects hold the attributes that desribe the color and finish of a surface.
class seen.Material
  @create : (value) ->
    if value instanceof seen.Material
      return value
    else if value instanceof seen.Color
      return new seen.Material(value)
    else if typeof value is 'string'
      return new seen.Material(seen.Colors.parse(value))
    else
      return new seen.Material()

  defaults :
    # The base color of the material.
    color            : seen.Colors.gray()

    # The `metallic` attribute determines how the specular highlights are
    # calculated. Normally, specular highlights are the color of the light
    # source. If metallic is true, specular highlight colors are determined
    # from the `specularColor` attribute.
    metallic         : false

    # The color used for specular highlights when `metallic` is true.
    specularColor    : seen.Colors.white()

    # The `specularExponent` determines how "shiny" the material is. A low
    # exponent will create a low-intesity, diffuse specular shine. A high
    # exponent will create an intense, point-like specular shine.
    specularExponent : 15

    # A `Shader` object may be supplied to override the shader used for this
    # material. For example, if you want to apply a flat color to text or
    # other shapes, set this value to `seen.Shaders.Flat`.
    shader           : null

  constructor : (@color, options = {}) ->
    seen.Util.defaults(@, options, @defaults)

  # Apply the shader's shading to this material, with the option to override
  # the shader with the material's shader (if defined).
  render : (lights, shader, renderData) ->
    renderShader = @shader ? shader
    color = renderShader.shade(lights, renderData, @)
    color.a = @color.a
    return color


# ## Lights
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
    @id = seen.Util.uniqueId('l')

  render : ->
    @colorIntensity = @color.copy().scale(@intensity)

seen.Lights = {
  # A point light emits light eminating in all directions from a single point.
  # The `point` property determines the location of the point light. Note,
  # though, that it may also be moved through the transformation of the light.
  point       : (opts) -> new seen.Light 'point', opts

  # A directional lights emit light in parallel lines, not eminating from any
  # single point. For these lights, only the `normal` property is used to
  # determine the direction of the light. This may also be transformed.
  directional : (opts) -> new seen.Light 'directional', opts

  # Ambient lights emit a constant amount of light everywhere at once.
  # Transformation of the light has no effect.
  ambient     : (opts) -> new seen.Light 'ambient', opts
}


# ## Shaders
# ------------------

EYE_NORMAL = seen.Points.Z()

# These shading functions compute the shading for a surface. To reduce code
# duplication, we aggregate them in a utils object.
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
      reflectionNormal  = surfaceNormal.copy().multiply(dot * 2).subtract(lightNormal)
      specularIntensity = Math.pow(0.5 + reflectionNormal.dot(EYE_NORMAL), material.specularExponent)
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
  shade: (lights, renderModel, material) -> # Override this

# The `Phong` shader implements the Phong shading model with a diffuse,
# specular, and ambient term.
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

# The `DiffusePhong` shader implements the Phong shading model with a diffuse
# and ambient term (no specular).
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

# The `Flat` shader colors surfaces with the material color, disregarding all
# light sources.
class Flat extends seen.Shader
  shade: (lights, renderModel, material) ->
    return material.color

seen.Shaders = {
  phong   : -> new Phong()
  diffuse : -> new DiffusePhong()
  ambient : -> new Ambient()
  flat    : -> new Flat()
}


# ## Affine
# #### Fake projections with affine transforms
# ------------------
#
# It is not possible exactly render text in a scene with a perspective
# projection because Canvas and SVG support only affine transformations. So,
# in order to fake it, we create an affine transform that approximates the
# linear effects of a perspective projection on an unrendered planar surface
# that represents the text's shape. We can use this transform directly in the
# text painter to warp the text.
#
# This fake projection will produce unrealistic results with large strings of
# text that are not broken into their own shapes.
seen.Affine = {

  # This is the set of points that must be used by a surface that will use an
  # affine transform for rendering.
  ORTHONORMAL_BASIS : -> [
    seen.P( 0, 0,  0)
    seen.P(20, 0,  0)
    seen.P( 0, 20, 0)
  ]

  # This matrix is built using the method from this StackOverflow answer:
  # http://stackoverflow.com/questions/22954239/given-three-points-compute-affine-transformation
  #
  # We further re-arranged the rows to avoid having to do any matrix factorization.
  INITIAL_STATE_MATRIX : [
    [20,  0, 1,  0,  0, 0]
    [ 0, 20, 1,  0,  0, 0]
    [ 0,  0, 1,  0,  0, 0]
    [ 0,  0, 0, 20,  0, 1]
    [ 0,  0, 0,  0, 20, 1]
    [ 0,  0, 0,  0,  0, 1]
  ]

  # Computes the parameters of an affine transform from the 3 projected
  # points.
  # 
  # Because we control the initial values of the points, we can re-use the
  # state matrix. Furthermore, because we have use a special layout (upper
  # triangular) for this matrix, we avoid any matrix factorization and can go
  # directly to back-substitution to solve the matrix equation.
  #
  # To use the affine transform, use the indices like so (note that we flip y):
  #     x[0], x[3], -x[1], -x[4], x[2], x[5]
  solveForAffineTransform : (points) ->
    A = seen.Affine.INITIAL_STATE_MATRIX

    b = [
      points[1].x
      points[2].x
      points[0].x
      points[1].y
      points[2].y
      points[0].y
    ]

    # Use back substitution to solve A*x=b for x
    x = new Array(6)
    n = A.length
    for i in [(n-1)..0] by -1
      x[i] = b[i]
      for j in [(i+1)...n]
        x[i] -= A[i][j] * x[j]
      x[i] /= A[i][i]

    return x
}


# ## Render Contexts
# ------------------

# The `RenderContext` uses `RenderModel`s produced by the scene's render method to paint the shapes into an HTML element.
# Since we support both SVG and Canvas painters, the `RenderContext` and `RenderLayerContext` define a common interface.
class seen.RenderContext
  constructor: ->
    @layers = []

  render: () =>
    @reset()
    for layer in @layers
      layer.context.reset()
      layer.layer.render(layer.context)
      layer.context.cleanup()
    @cleanup()
    return @

  # Returns a new `Animator` with this context's render method pre-registered.
  animate : ->
    return new seen.RenderAnimator(@)

  # Add a new `RenderLayerContext` to this context. This allows us to easily stack paintable components such as
  # a fill backdrop, or even multiple scenes in one context.
  layer: (layer) ->
    @layers.push {
      layer   : layer
      context : @
    }
    return @

  sceneLayer : (scene) ->
    @layer(new seen.SceneLayer(scene))
    return @

  reset   : ->
  cleanup : ->

# The `RenderLayerContext` defines the interface for producing painters that can paint various things into the current layer.
class seen.RenderLayerContext
  path    : -> # Return a path painter
  rect    : -> # Return a rect painter
  circle  : -> # Return a circle painter
  text    : -> # Return a text painter

  reset   : ->
  cleanup : ->

# Create a render context for the element with the specified `elementId`. elementId
# should correspond to either an SVG or Canvas element.
seen.Context = (elementId, scene = null) ->
  tag = seen.Util.element(elementId)?.tagName.toUpperCase()
  context = switch tag
    when 'SVG', 'G' then new seen.SvgRenderContext(elementId)
    when 'CANVAS'   then new seen.CanvasRenderContext(elementId)
  if context? and scene?
    context.sceneLayer(scene)
  return context



# ## Painters
# #### Surface painters
# ------------------

# Each `Painter` overrides the paint method. It uses the supplied
# `RenderLayerContext`'s builders to create and style the geometry on screen.
class seen.Painter
  paint : (renderModel, context) ->

class seen.PathPainter extends seen.Painter
  paint : (renderModel, context) ->
    painter = context.path().path(renderModel.projected.points)

    if renderModel.fill?
      painter.fill(
        fill           : if not renderModel.fill? then 'none' else renderModel.fill.hex()
        'fill-opacity' : if not renderModel.fill?.a? then 1.0 else (renderModel.fill.a / 255.0)
      )

    if renderModel.stroke?
      painter.draw(
        fill           : 'none'
        stroke         : if not renderModel.stroke? then 'none' else renderModel.stroke.hex()
        'stroke-width' : renderModel.surface['stroke-width'] ? 1
      )

class seen.TextPainter extends seen.Painter
  paint : (renderModel, context) ->
    style = {
      fill          : if not renderModel.fill? then 'none' else renderModel.fill.hex()
      font          : renderModel.surface.font
      'text-anchor' : renderModel.surface.anchor ? 'middle'
    }
    xform = seen.Affine.solveForAffineTransform(renderModel.projected.points)
    context.text().fillText(xform, renderModel.surface.text, style)

seen.Painters = {
  path : new seen.PathPainter()
  text : new seen.TextPainter()
}


# ## RenderModels
# ------------------

DEFAULT_NORMAL = seen.Points.Z()

# The `RenderModel` object contains the transformed and projected points as
# well as various data needed to shade and paint a `Surface`.
#
# Once initialized, the object will have a constant memory footprint down to
# `Number` primitives. Also, we compare each transform and projection to
# prevent unnecessary re-computation.
#
# If you need to force a re-computation, mark the surface as 'dirty'.
class seen.RenderModel
  constructor: (@surface, @transform, @projection, @viewport) ->
    @points      = @surface.points
    @transformed = @_initRenderData()
    @projected   = @_initRenderData()
    @_update()

  update: (transform, projection, viewport) ->
    if not @surface.dirty and seen.Util.arraysEqual(transform.m, @transform.m) and seen.Util.arraysEqual(projection.m, @projection.m) and seen.Util.arraysEqual(viewport.m, @viewport.m)
      return
    else
      @transform  = transform
      @projection = projection
      @viewport   = viewport
      @_update()

  _update: () ->
    # Apply model transforms to surface points
    @_math(@transformed, @points, @transform, false)
    # Project into camera space
    cameraSpace = @transformed.points.map (p) => p.copy().transform(@projection)
    @inFrustrum = @_checkFrustrum(cameraSpace)
    # Project into screen space
    @_math(@projected, cameraSpace, @viewport, true)
    @surface.dirty = false

  _checkFrustrum : (points) ->
    for p in points
      return false if (p.z <= -2)
    return true

  _initRenderData: ->
    return {
      points     : (p.copy() for p in @points)
      bounds     : new seen.Bounds()
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
      # Applying the clip is what ultimately scales the x and y coordinates in
      # a perpsective projection
      if applyClip then sp.divide(sp.w)

    # Compute barycenter, which is used in aligning shapes in the painters
    # algorithm
    set.barycenter.multiply(0)
    for p in set.points
      set.barycenter.add(p)
    set.barycenter.divide(set.points.length)

    # Compute the bounding box of the points
    set.bounds.reset()
    for p in set.points
      set.bounds.add(p)

    # Compute normal, which is used for backface culling (when enabled)
    if set.points.length < 2
      set.v0.set(DEFAULT_NORMAL)
      set.v1.set(DEFAULT_NORMAL)
      set.normal.set(DEFAULT_NORMAL)
    else
      set.v0.set(set.points[1]).subtract(set.points[0])
      set.v1.set(set.points[points.length - 1]).subtract(set.points[0])
      set.normal.set(set.v0).cross(set.v1).normalize()

# The `LightRenderModel` stores pre-computed values necessary for shading
# surfaces with the supplied `Light`.
class seen.LightRenderModel
  constructor: (@light, transform) ->
    @colorIntensity = @light.color.copy().scale(@light.intensity)
    @type           = @light.type
    @intensity      = @light.intensity
    @point          = @light.point.copy().transform(transform)
    origin          = seen.Points.ZERO().transform(transform)
    @normal         = @light.normal.copy().transform(transform).subtract(origin).normalize()


# ## Layers
# ------------------

class seen.RenderLayer
  render: (context) =>

class seen.SceneLayer extends seen.RenderLayer
  constructor : (@scene) ->

  render : (context) =>
    for renderModel in @scene.render()
      renderModel.surface.painter.paint(renderModel, context)

class seen.FillLayer extends seen.RenderLayer
  constructor : (@width = 500, @height = 500, @fill = '#EEE') ->

  render: (context) =>
    context.rect()
      .rect(@width, @height)
      .fill(fill : @fill)


# ## SVG Context
# ------------------

# Creates a new SVG element in the SVG namespace.
_svg = (name) ->
  return document.createElementNS('http://www.w3.org/2000/svg', name)

class seen.SvgStyler
  _attributes : {}
  _svgTag     : 'g'

  constructor : (@elementFactory) ->

  clear : () ->
    @_attributes = {}
    return @

  fill : (style = {}) ->
    @_paint(style)
    return @

  draw : (style = {}) ->
    @_paint(style)
    return @

  _paint : (style) ->
    el = @elementFactory(@_svgTag)

    str = ''
    for key, value of style
      str += "#{key}:#{value};"
    el.setAttribute('style', str)

    for key, value of @_attributes
      el.setAttribute(key, value)
    return el

class seen.SvgPathPainter extends seen.SvgStyler
  _svgTag : 'path'

  path : (points) ->
    @_attributes.d = 'M' + points.map((p) -> "#{p.x} #{p.y}").join 'L'
    return @

class seen.SvgTextPainter
  _svgTag      : 'text'

  constructor : (@elementFactory) ->

  fillText : (m, text, style = {}) ->
    el = @elementFactory(@_svgTag)
    el.setAttribute('transform', "matrix(#{m[0]} #{m[3]} #{-m[1]} #{-m[4]} #{m[2]} #{m[5]})")

    str = ''
    for key, value of style
      if value? then str += "#{key}:#{value};"
    el.setAttribute('style', str)

    el.textContent = text


class seen.SvgRectPainter extends seen.SvgStyler
  _svgTag : 'rect'

  rect : (width, height) ->
    @_attributes.width  = width
    @_attributes.height = height
    return @

class seen.SvgCirclePainter extends seen.SvgStyler
  _svgTag : 'circle'

  circle: (center, radius) ->
    @_attributes.cx = center.x
    @_attributes.cy = center.y
    @_attributes.r  = radius
    return @

class seen.SvgLayerRenderContext extends seen.RenderLayerContext
  constructor : (@group) ->
    @pathPainter   = new seen.SvgPathPainter(@_elementFactory)
    @textPainter   = new seen.SvgTextPainter(@_elementFactory)
    @circlePainter = new seen.SvgCirclePainter(@_elementFactory)
    @rectPainter   = new seen.SvgRectPainter(@_elementFactory)
    @_i = 0

  path   : () -> @pathPainter.clear()
  rect   : () -> @rectPainter.clear()
  circle : () -> @circlePainter.clear()
  text   : () -> @textPainter

  reset : ->
    @_i = 0

  cleanup : ->
    children = @group.childNodes
    while (@_i < children.length)
      children[@_i].setAttribute('style', 'display: none;')
      @_i++

  # Returns an element with tagname `type`.
  #
  # This method uses an internal iterator to add new elements as they are
  # drawn. If there is no child element at the current index, we append one
  # and return it. If an element exists at the current index and it is the
  # same type, we return that. If the element is a different type, we create
  # one and replace it then return it.
  _elementFactory : (type) =>
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

  layer : (layer) ->
    @svg.appendChild(group = _svg('g'))
    @layers.push {
      layer   : layer
      context : new seen.SvgLayerRenderContext(group)
    }
    return @

seen.SvgContext = (elementId, scene) ->
  context = new seen.SvgRenderContext(elementId)
  if scene? then context.sceneLayer(scene)
  return context


# ## HTML5 Canvas Context
# ------------------

class seen.CanvasStyler
  constructor : (@ctx) ->

  draw : (style = {}) ->
    # Copy over SVG CSS attributes
    if style.stroke? then @ctx.strokeStyle = style.stroke
    if style['stroke-width']? then @ctx.lineWidth = style['stroke-width']
    if style['text-anchor']? then @ctx.textAlign = style['text-anchor']

    @ctx.stroke()
    return @

  fill : (style = {}) ->
    # Copy over SVG CSS attributes
    if style.fill? then @ctx.fillStyle = style.fill
    if style['text-anchor']? then @ctx.textAlign = style['text-anchor']
    if style['fill-opacity'] then @ctx.globalAlpha = style['fill-opacity']

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
  rect: (width, height) ->
    @ctx.rect(0, 0, width, height)
    return @

class seen.CanvasCirclePainter extends seen.CanvasStyler
  circle: (center, radius) ->
    @ctx.beginPath()
    @ctx.arc(center.x, center.y, radius, 0, 2*Math.PI, true)
    return @

class seen.CanvasTextPainter
  constructor : (@ctx) ->

  fillText : (m, text, style = {}) ->
    @ctx.save()
    @ctx.setTransform(m[0], m[3], -m[1], -m[4], m[2], m[5])

    if style.font? then @ctx.font = style.font
    if style.fill? then @ctx.fillStyle = style.fill
    if style['text-anchor']? then @ctx.textAlign = @_cssToCanvasAnchor(style['text-anchor'])

    @ctx.fillText(text, 0, 0)
    @ctx.restore()
    return @

  _cssToCanvasAnchor : (anchor) ->
    if anchor is 'middle' then return 'center'
    return anchor

class seen.CanvasLayerRenderContext extends seen.RenderLayerContext
  constructor : (@ctx) ->
    @pathPainter  = new seen.CanvasPathPainter(@ctx)
    @ciclePainter = new seen.CanvasCirclePainter(@ctx)
    @textPainter  = new seen.CanvasTextPainter(@ctx)
    @rectPainter  = new seen.CanvasRectPainter(@ctx)
  
  path   : () -> @pathPainter
  rect   : () -> @rectPainter
  circle : () -> @ciclePainter
  text   : () -> @textPainter

class seen.CanvasRenderContext extends seen.RenderContext
  constructor: (@el) ->
    super()
    @el  = seen.Util.element(@el)
    @ctx = @el.getContext('2d')

  layer : (layer) ->
    @layers.push {
      layer   : layer
      context : new seen.CanvasLayerRenderContext(@ctx)
    }
    return @

  reset : ->
    @ctx.setTransform(1, 0, 0, 1, 0, 0)
    @ctx.clearRect(0, 0, @el.width, @el.height)

seen.CanvasContext = (elementId, scene) ->
  context = new seen.CanvasRenderContext(elementId)
  if scene? then context.sceneLayer(scene)
  return context



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

    @el = seen.Util.element(@el)

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

    @dispatch = seen.Events.dispatch('drag', 'dragStart', 'dragEnd', 'dragEndInertia')
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
    @dispatch.dragStart(e)

  _onDragEnd : (e) =>
    @_dragState.dragging = false

    if @inertia
      page = @_getPageCoords(e)
      dragEvent =
        offset         : [page[0] - @_dragState.origin[0], page[1] - @_dragState.origin[1]]
        offsetRelative : [page[0] - @_dragState.last[0], page[1] - @_dragState.last[1]]

      @_dragState.inertia.update(dragEvent.offsetRelative)
      @_startInertia()

    @dispatch.dragEnd(e)

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
      @dispatch.dragEndInertia()
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


# ## Surfaces and Shapes
# ------------------

# A `Surface` is a defined as a planar object in 3D space. These paths don't
# necessarily need to be convex, but they should be non-degenerate. This
# library does not support shapes with holes.
class seen.Surface
  # When 'false' this will override backface culling, which is useful if your
  # material is transparent. See comment in `seen.Scene`.
  cullBackfaces  : true

  # Fill and stroke may be `Material` objects, which define the color and
  # finish of the object and are rendered using the scene's shader.
  fillMaterial   : new seen.Material(seen.C.gray)
  strokeMaterial : null

  constructor : (@points, @painter = seen.Painters.path) ->
    # We store a unique id for every surface so we can look them up quickly
    # with the `renderModel` cache.
    @id = 's' + seen.Util.uniqueId()

  fill : (fill) ->
    @fillMaterial = seen.Material.create(fill)
    return @

  stroke : (stroke) ->
    @strokeMaterial = seen.Material.create(stroke)
    return @

# A `Shape` contains a collection of surface. They may create a closed 3D
# shape, but not necessarily. For example, a cube is a closed shape, but a
# patch is not.
class seen.Shape extends seen.Transformable
  constructor : (@type, @surfaces) ->
    super()

  # Visit each surface
  eachSurface: (f) ->
    @surfaces.forEach(f)
    return @

  # Apply the supplied fill `Material` to each surface
  fill : (fill) ->
    @eachSurface (s) -> s.fill(fill)
    return @

  # Apply the supplied stroke `Material` to each surface
  stroke : (stroke) ->
    @eachSurface (s) -> s.stroke(stroke)
    return @


# ## Models
# ------------------

# The object model class. It stores `Shapes`, `Lights`, and other `Models` as
# well as a transformation matrix.
#
# Notably, models are hierarchical, like a tree. This means you can isolate
# the transformation of groups of shapes in the scene, as well as create
# chains of transformations for creating, for example, articulated skeletons.
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

  # Remove a shape, model, or light from the model. NOTE: the scene may still
  # contain a renderModel in its cache. If you are adding and removing many items,
  # consider calling `.flush()` on the scene to flush its renderModel cache.
  remove : (childs...) ->
    for child in childs
      while (i = @children.indexOf(child)) >= 0
        @children.splice(i,1)
      while (i = @lights.indexOf(child)) >= 0
        @lights.splice(i,1)

  # Create a new child model and return it.
  append: () ->
    model = new seen.Model
    @add model
    return model

  # Visit each `Shape` in this `Model` and all recursive child `Model`s.
  eachShape: (f) ->
    for child in @children
      if child instanceof seen.Shape
        f.call(@, child)
      if child instanceof seen.Model
        child.eachShape(f)

  # Visit each `Light` and `Shape`, accumulating the recursive transformation
  # matrices along the way. The light callback will be called with each light
  # and its accumulated transform and it should return a `LightModel`. Each
  # shape callback with be called with each shape and its accumulated
  # transform as well as the list of light models that apply to that shape.
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

# Map to points in the surfaces of a tetrahedron
TETRAHEDRON_COORDINATE_MAP = [
  [0, 2, 1]
  [0, 1, 3]
  [3, 2, 0]
  [1, 2, 3]
]

# Map to points in the surfaces of a cube
CUBE_COORDINATE_MAP = [
  [0, 1, 3, 2] # left
  [5, 4, 6, 7] # right
  [1, 0, 4, 5] # bottom
  [2, 3, 7, 6] # top
  [3, 1, 5, 7] # front
  [0, 2, 6, 4] # back
]

# Map to points in the surfaces of a rectangular pyramid
PYRAMID_COORDINATE_MAP = [
  [1, 0, 2, 3] # bottom
  [0, 1, 4] # left
  [2, 0, 4] # rear
  [3, 2, 4] # right
  [1, 3, 4] # front
]

# Altitude of eqiulateral triangle for computing triangular patch size
EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0

# Points array of an icosahedron
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

# Map to points in the surfaces of an icosahedron
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
  # Returns a 2x2x2 cube, centered on the origin.
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

    return new seen.Shape('cube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns a 1x1x1 cube from the origin to [1, 1, 1].
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

    return new seen.Shape('unitcube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns an axis-aligned 3D rectangle whose boundaries are defined by the
  # two supplied points.
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

    return new seen.Shape('rect', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns a square pyramid inside a unit cube
  pyramid : =>
    points = [
      seen.P(0, 0, 0)
      seen.P(0, 0, 1)
      seen.P(1, 0, 0)
      seen.P(1, 0, 1)
      seen.P(0.5, 1, 0.5)
    ]

    return new seen.Shape('pyramid', seen.Shapes.mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP))

  # Returns a tetrahedron that fits inside a 2x2x2 cube.
  tetrahedron: =>
    points = [
      seen.P( 1,  1,  1)
      seen.P(-1, -1,  1)
      seen.P(-1,  1, -1)
      seen.P( 1, -1, -1)]

    return new seen.Shape('tetrahedron', seen.Shapes.mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP))

  # Returns an icosahedron that fits within a 2x2x2 cube, centered on the
  # origin.
  icosahedron : ->
    return new seen.Shape('icosahedron', seen.Shapes.mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP))

  # Returns a sub-divided icosahedron, which approximates a sphere with
  # triangles of equal size.
  sphere : (subdivisions = 2) ->
    triangles = ICOSAHEDRON_COORDINATE_MAP.map (coords) -> coords.map (c) -> ICOSAHEDRON_POINTS[c]
    for i in [0...subdivisions]
      triangles = seen.Shapes._subdivideTriangles(triangles)
    return new seen.Shape('sphere', triangles.map (triangle) -> new seen.Surface(triangle.map (v) -> v.copy()))

  # Returns a planar triangular patch. The supplied arguments determine the
  # number of triangle in the patch.
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

  # Return a text surface that can render 3D text using an affine transform estimate of the projection
  text : (text, surfaceOptions = {}) ->
    surface = new seen.Surface(seen.Affine.ORTHONORMAL_BASIS(), seen.Painters.text)
    surface.text = text
    for key, val of surfaceOptions
      surface[key] = val
    return new seen.Shape('text', [surface])

  # Returns a shape that is an extrusion of the supplied points into the z axis.
  extrude : (points, offset) ->
    surfaces = []
    front = new seen.Surface (p.copy() for p in points)
    back  = new seen.Surface (p.add(offset) for p in points)

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
    return seen.Shapes.extrude(points, seen.P(0,0,thickness))

  # Returns a shape with a single surface using the supplied points array
  path : (points) ->
    return new seen.Shape('path', [new seen.Surface(points)])

  # Accepts a 2-dimensional array of tuples, returns a shape where the tuples
  # represent points of a planar surface.
  custom : (s) ->
    surfaces = []
    for f in s.surfaces
      surfaces.push new seen.Surface((seen.P(p...) for p in f))
    return new seen.Shape('custom', surfaces)

  # Joins the points into surfaces using the coordinate map, which is an
  # 2-dimensional array of index integers.
  mapPointsToSurfaces : (points, coordinateMap) ->
    surfaces = []
    for coords in coordinateMap
      spts = (points[c].copy() for c in coords)
      surfaces.push(new seen.Surface(spts))
    return surfaces

  # Accepts an array of 3-tuples and returns an array of 3-tuples representing
  # the triangular subdivision of the surface.
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

      continue if data.length < 2 # Check line parsing

      command = data.slice(0,1)[0]
      data    = data.slice(1)
      
      if command.charAt(0) is '#' # Check for comments
        continue
      if not @commands[command]? # Check that we know how the handle this command
        console.log "OBJ Parser: Skipping unknown command '#{command}'"
        continue

      @commands[command](data) # Execute command

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

# Polyfill requestAnimationFrame
if window?
  requestAnimationFrame =
      window.requestAnimationFrame ?
      window.mozRequestAnimationFrame ?
      window.webkitRequestAnimationFrame ?
      window.msRequestAnimationFrame

DEFAULT_FRAME_DELAY = 30 # msec

# The animator class is useful for creating an animation loop. We supply pre
# and post events for apply animation changes between frames.
class seen.Animator
  constructor : () ->
    @dispatch  = seen.Events.dispatch('beforeFrame', 'afterFrame', 'frame')
    @on        = @dispatch.on
    @timestamp = 0
    @_running  = false

  # Start the animation loop. The delay between frames can be supplied as an argument.
  start: (msecDelay) ->
    @_running   = true
    @_msecDelay = msecDelay
    @animateFrame()
    return @

  # Stop the animation loop.
  stop : ->
    @_running = false
    return @

  # Use requestAnimationFrame if available
  animateFrame : ->
    if requestAnimationFrame? and not @_msecDelay?
      requestAnimationFrame(@frame)
    else
      @_msecDelay ?= DEFAULT_FRAME_DELAY
      setTimeout(@frame, @_msecDelay)

  # The main animation frame method
  frame: (t) =>
    return unless @_running

    # create timestamp param even if requestAnimationFrame isn't available
    @_timestamp    = t ? (@_timestamp + (@_msecDelay ? DEFAULT_FRAME_DELAY))
    deltaTimestamp = if @_lastTimestamp? then @_timestamp - @_lastTimestamp else @_timestamp

    @dispatch.beforeFrame(@_timestamp, deltaTimestamp)
    @dispatch.frame(@_timestamp, deltaTimestamp)
    @dispatch.afterFrame(@_timestamp, deltaTimestamp)

    @_lastTimestamp = @_timestamp
    @animateFrame()
    return @

  # Add a callback that will be invoked before the frame
  onBefore : (handler) ->
    @on "beforeFrame.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a callback that will be invoked after the frame
  onAfter : (handler) ->
    @on "afterFrame.#{seen.Util.uniqueId('animator-')}", handler
    return @

  # Add a frame callback
  onFrame : (handler) ->
    @on "frame.#{seen.Util.uniqueId('animator-')}", handler
    return @

# A seen.Animator for rendering the seen.Context
class seen.RenderAnimator extends seen.Animator
  constructor : (context) ->
    super
    @onFrame(context.render)

 # A transition object to manage to animation of shapes
class seen.Transition
  defaults :
    duration : 100 # The duration of this transition in msec

  constructor : (options = {}) ->
    seen.Util.defaults(@, options, @defaults)

  update : (t) ->
    # Setup the first frame before the tick increment
    if not @t?
      @firstFrame()
      @startT = t

    # Execute a tick and draw a frame
    @t = t
    @tFrac = (@t - @startT) / @duration
    @frame()

    # Cleanup or update on last frame after tick
    if (@tFrac >= 1.0)
      @lastFrame()
      return false

    return true

  firstFrame : ->
  frame      : ->
  lastFrame  : ->

# A seen.Animator for updating seen.Transtions. We include keyframing to make
# sure we wait for one transition to finish before starting the next one.
class seen.TransitionAnimator extends seen.Animator
  constructor : ->
    super
    @queue       = []
    @transitions = []
    @onFrame(@update)

  # Adds a transition object to the current set of transitions. Note that
  # transitions will not start until they have been enqueued by invoking
  # `keyframe()` on this object.
  add : (txn) ->
    @transitions.push txn

  # Enqueues the current set of transitions into the keyframe queue and sets
  # up a new set of transitions.
  keyframe : ->
    @queue.push @transitions
    @transitions = []

  # When this animator updates, it invokes `update()` on all of the
  # currently animating transitions. If any of the current transitions are
  # not done, we re-enqueue them at the front. If all transitions are
  # complete, we will start animating the next set of transitions from the
  # keyframe queue on the next update.
  update : (t) =>
    return unless @queue.length
    transitions = @queue.shift()
    transitions = transitions.filter (transition) -> transition.update(t)
    if transitions.length then @queue.unshift(transitions)



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

  # Creates a orthographic projection matrix with the supplied frustrum
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
  # Create a viewport where the scene's origin is centered in the view
  center : (width = 500, height = 500, x = 0, y = 0) ->
    prescale = seen.M()
      .translate(-x, -y, -height)
      .scale(1/width, 1/height, 1/height)

    postscale = seen.M()
      .scale(width, -height, height)
      .translate(x + width/2, y + height/2, height)
    return {prescale, postscale}

  # Create a view port where the scene's origin is aligned with the origin ([0, 0]) of the view
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
class seen.Camera extends seen.Transformable
  defaults :
    projection : seen.Projections.perspective()

  constructor : (options) ->
    seen.Util.defaults(@, options, @defaults)
    super



# ## Scene
# ------------------

# A `Scene` is the main object for a view of a scene.
class seen.Scene
  defaults: ->
    # The root model for the scene, which contains `Shape`s, `Light`s, and
    # other `Model`s
    model            : new seen.Model()

    # The `Camera`, which defines the projection transformation. The default
    # projection is perspective.
    camera           : new seen.Camera()

    # The `Viewport`, which defines the projection from shape-space to
    # projection-space then to screen-space. The default viewport is on a
    # space from (0,0,0) to (1,1,1). To map more naturally to pixels, create a
    # viewport with the same width/height as the DOM element.
    viewport         : seen.Viewports.origin(1,1)

    # The scene's shader determines which lighting model is used.
    shader           : seen.Shaders.phong()

    # The `cullBackfaces` boolean can be used to turn off backface-culling
    # for the whole scene. Beware, turning this off can slow down a scene's
    # rendering by a factor of 2. You can also turn off backface-culling for
    # individual surfaces with a boolean on those objects.
    cullBackfaces    : true

    # The `fractionalPoints` boolean determines if we round the surface
    # coordinates to the nearest integer. Rounding the coordinates before
    # display speeds up path drawing  especially when using an SVG context
    # since it cuts down on the length of path data. Anecdotally, my speedup
    # on a complex demo scene was 10 FPS. However, it does introduce a slight
    # jittering effect when animating.
    fractionalPoints : false

    # The `cache` boolean (default : true) enables a simple cache for
    # renderModels, which are generated for each surface in the scene. The
    # cache is a simple Object keyed by the surface's unique id. The cache has
    # no eviction policy. To flush the cache, call `.flushCache()`
    cache            : true

  constructor: (options) ->
    seen.Util.defaults(@, options, @defaults())
    @_renderModelCache = {}

  # The primary method that produces the render models, which are then used
  # by the `RenderContext` to paint the scene.
  render : () =>
    # Compute the projection matrix including the viewport and camera
    # transformation matrices.
    projection = @camera.m.copy()
      .multiply(@viewport.prescale)
      .multiply(@camera.projection)
    viewport   = @viewport.postscale

    renderModels = []
    @model.eachRenderable(
      (light, transform) ->
        # Compute light model data.
        new seen.LightRenderModel(light, transform)

      (shape, lights, transform) =>
        for surface in shape.surfaces
          # Compute transformed and projected geometry.
          renderModel = @_renderSurface(surface, transform, projection, viewport)

          # Test projected normal's z-coordinate for culling (if enabled).
          if (not @cullBackfaces or not surface.cullBackfaces or renderModel.projected.normal.z < 0) and renderModel.inFrustrum
            # Render fill and stroke using material and shader.
            renderModel.fill   = surface.fillMaterial?.render(lights, @shader, renderModel.transformed)
            renderModel.stroke = surface.strokeMaterial?.render(lights, @shader, renderModel.transformed)

            # Round coordinates (if enabled)
            if @fractionalPoints isnt true
              p.round() for p in renderModel.projected.points

            renderModels.push renderModel
    )

    # Sort render models by projected z coordinate. This ensures that the surfaces
    # farthest from the eye are painted first. (Painter's Algorithm)
    renderModels.sort (a, b) ->
      return  b.projected.barycenter.z - a.projected.barycenter.z

    return renderModels

  # Get or create the rendermodel for the given surface. If `@cache` is true, we cache these models
  # to reduce object creation and recomputation.
  _renderSurface : (surface, transform, projection, viewport) ->
    if not @cache
      return new seen.RenderModel(surface, transform, projection, viewport)

    renderModel = @_renderModelCache[surface.id]
    if not renderModel?
      renderModel = @_renderModelCache[surface.id] = new seen.RenderModel(surface, transform, projection, viewport)
    else
      renderModel.update(transform, projection, viewport)
    return renderModel

  # Removes all elements from the cache. This may be necessary if you add and
  # remove many shapes from the scene's models since this cache has no
  # eviction policy.
  flushCache : () =>
    @_renderModelCache = {}

