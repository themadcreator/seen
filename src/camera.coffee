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

