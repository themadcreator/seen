
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
    return @

  # Returns a new matrix instances with a copy of the value array
  copy : ->
    return new seen.Matrix(@m.slice())

  # Multiply by the 16-value `Array` argument. This method uses the `ARRAY_POOL`, which prevents us from having to re-initialize a new temporary matrix every time. This drastically improves performance.
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

  # Resets the matrix to the identity matrix.
  reset : ->
    @m = IDENTITY.slice()
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

  # Apply a scale. If not all arguments are supplied, each dimension (x,y,z) is copied from the previous arugment. Therefore, `_scale()` is equivalent to `_scale(1,1,1)`, and `_scale(1,-1)` is equivalent to `_scale(1,-1,-1)`
  scale : (sx, sy, sz, sw) ->
    sx     ?= 1
    sy     ?= sx
    sz     ?= sy
    sw     ?= sz
    @m[0]  *= sx
    @m[5]  *= sy
    @m[10] *= sz
    return @

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

    # We create shims for all of the matrix transformation methods so they
    # have the same interface.
    for method in ['scale', 'translate', 'rotx', 'roty', 'rotz', 'matrix', 'reset'] then do (method) =>
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
      @set(seen.Points.Z)
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
  X    : seen.P(1, 0, 0)
  Y    : seen.P(0, 1, 0)
  Z    : seen.P(0, 0, 1)
  ZERO : seen.P(0, 0, 0)
}

# A Quaterionion class for computing quaterion multiplications. This creates
# more natural mouse rotations.
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


