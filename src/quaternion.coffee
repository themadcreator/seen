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
