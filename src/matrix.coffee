
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



