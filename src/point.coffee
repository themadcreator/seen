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
