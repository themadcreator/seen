# ## Projections
# #### Projections and viewport tranformations.
# ------------------

seen.Projections = {
  perspectiveFov : (fovyInDegrees = 50, front = 1) ->
    tan = front * Math.tan(fovyInDegrees * Math.PI / 360.0)
    return seen.Projections.perspective(-tan, tan, -tan, tan, front, 2*front)

  orthoExtent : (extentX, extentY, extentZ) ->
    extentX ?= 100
    extentY ?= extentX
    extentZ ?= extentY
    return seen.Projections.ortho(
      -extentX
      extentX
      -extentY
      extentY
      extentY
      2*extentY
    )

  # Creates a perspective projection matrix assuming camera is at (0,0,0)
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

class seen.Camera
  defaults :
    projection : seen.Projections.perspective()
    viewport   : seen.Viewports.center()
    camera     : seen.Matrices.identity.copy()

  constructor : (options) ->
    seen.Util.defaults(@, options, @defaults)

  getMatrix : ->
    @camera.copy().multiply(@viewport.prescale).multiply(@projection).multiply(@viewport.postscale)

