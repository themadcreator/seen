
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

# `Transformable` base class extended by `Shape` and `Model`.
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
    return new seen.Point(@x, @y, @z, @w)

  # Apply a translation
  translate: (x, y, z) ->
    p = @copy()
    p.x += x
    p.y += y
    p.z += z
    return p

  # Computes the dot product with the supplied `Point`.
  dot: (q) ->
    return @x * q.x + @y * q.y + @z * q.z

  # Destructively computes the cross product with the supplied `Point`.
  cross: (q) ->
    r = POINT_POOL
    r.x = @y * q.z - @z * q.y
    r.y = @z * q.x - @x * q.z
    r.z = @x * q.y - @y * q.x

    @set(r)
    return @

  # Destructively multiplies each parameters by the supplied scalar value.
  multiply: (n) ->
    @x *= n
    @y *= n
    @z *= n
    return @

  # Destructively divides each parameters by the supplied scalar value.
  divide: (n) ->
    @x /= n
    @y /= n
    @z /= n
    return @

  # Destructively scales this `Point` by its magnitude.
  normalize: () ->
    n = Math.sqrt(@dot(@))
    if n == 0
      @set(seen.Points.Z)
    else
      @divide(n)
    return @

  # Destructively performs parameter-wise addition with the supplied `Point`.
  add: (q) ->
    @x += q.x
    @y += q.y
    @z += q.z
    return @

  # Destructively performs parameter-wise subtraction with the supplied `Point`.
  subtract: (q) ->
    @x -= q.x
    @y -= q.y
    @z -= q.z
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

