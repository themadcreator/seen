seen = (exports ? this).seen ?= {}

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
