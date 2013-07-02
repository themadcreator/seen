seen = (exports ? this).seen ?= {}

do ->
  ARRAY_CACHE = new Array(16)
  IDENTITY = [1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              0.0, 0.0, 0.0, 1.0]

  class Matrix
    constructor: (@m = null) ->
      @m ?= IDENTITY.slice()
      return @

    copy: ->
      return new Matrix(@m.slice())

    reset: ->
      @m = IDENTITY.slice()
      return @

    _multiplyM: (m) ->
      c = ARRAY_CACHE
      for j in [0...4]
        for i in [0...16] by 4
          c[i + j] = 
            m[i    ] * @m[     j] + 
            m[i + 1] * @m[ 4 + j] + 
            m[i + 2] * @m[ 8 + j] +
            m[i + 3] * @m[12 + j]
      ARRAY_CACHE = @m
      @m = c
      return @

    _rotx: (theta) ->
      ct = Math.cos(theta)
      st = Math.sin(theta)
      rm = [ 1, 0, 0, 0, 0, ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1 ]
      return @_multiplyM(rm)

    _roty: (theta)  ->
      ct = Math.cos(theta)
      st = Math.sin(theta)
      rm = [ ct, 0, st, 0, 0, 1, 0, 0, -st, 0, ct, 0, 0, 0, 0, 1 ]
      return @_multiplyM(rm)

    _rotz: (theta) ->
      ct = Math.cos(theta)
      st = Math.sin(theta)
      rm = [ ct, -st, 0, 0, st, ct, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]
      return @_multiplyM(rm)

    _translate: (x = 0, y = 0, z = 0) ->
      @m[3]  += x
      @m[7]  += y
      @m[11] += z
      return @

    _scale: (sx = 1, sy, sz) ->
      sy     ?= sx
      sz     ?= sy
      @m[0]  *= sx
      @m[5]  *= sy
      @m[10] *= sz
      return @

    multiply: (b) ->
      return @multiplyM(b.m)

    multiplyM: (m) ->
      return @copy()._multiplyM(m)

    rotx: (theta) ->
      return @copy()._rotx(theta)

    roty: (theta) ->
      return @copy()._roty(theta)

    rotz: (theta) ->
      return @copy()._rotz(theta)

    translate: (x,y,z) ->
      return @copy()._translate(x,y,z)

    scale: (sx,sy,sz) ->
      return @copy()._scale(sx,sy,sx)

  seen.Matrices = {
    identity : new Matrix()
    flipX    : new Matrix()._scale(-1, 1, 1)
    flipY    : new Matrix()._scale( 1,-1, 1)
    flipZ    : new Matrix()._scale( 1, 1,-1)
  }

  class Transformable
    constructor: ->
      @m = new Matrix

    scale: (sx, sy, sz) ->
      @m._scale(sx, sy, sz)
      return @

    translate: (x, y, z) ->
      @m._translate(x,y,z)
      return @

    rotx: (theta) ->
      @m._rotx(theta)
      return @

    roty: (theta) ->
      @m._roty(theta)
      return @

    rotz: (theta) ->
      @m._rotz(theta)
      return @

    matrix: (m) ->
      @m._multiplyM(m)
      return @

    transform: (m) ->
      @m._multiply(m)
      return @

    reset: () ->
      @m.reset()
      return @


  class Point
    constructor: (@x = 0, @y = 0, @z = 0, @w = 1) ->

    transform: (matrix) ->
      r = POINT_CACHE
      r.x = @x * matrix.m[0] + @y * matrix.m[1] + @z * matrix.m[2] + @w * matrix.m[3]
      r.y = @x * matrix.m[4] + @y * matrix.m[5] + @z * matrix.m[6] + @w * matrix.m[7]
      r.z = @x * matrix.m[8] + @y * matrix.m[9] + @z * matrix.m[10] + @w * matrix.m[11]
      r.w = @x * matrix.m[12] + @y * matrix.m[13] + @z * matrix.m[14] + @w * matrix.m[15]
    
      @set(r)
      return @

    set: (p) ->
      @x = p.x
      @y = p.y
      @z = p.z
      @w = p.w
      return @
    
    copy: () ->
      return new Point(@x, @y, @z, @w)

    normalize: () ->
      return @copy()._normalize()
    
    add: (q) ->
      return @copy()._add(q)

    subtract: (q) ->
      return @copy()._subtract(q)

    multiply: (q) ->
      return @copy()._multiply(q)

    divide: (q) ->
      return @copy()._divide(q)

    cross: (q) ->
      return @copy()._cross(q)

    dot: (q) ->
      return @x * q.x + @y * q.y + @z * q.z

    _multiply: (n) ->
      @x *= n
      @y *= n
      @z *= n
      return @

    _divide: (n) ->
      @x /= n
      @y /= n
      @z /= n
      return @

    _normalize: () ->
      n = Math.sqrt(@dot(@))
      if n == 0
        @set(Points.Z)
      else
        @_divide(n)
      return @

    _add: (q) ->
      @x += q.x
      @y += q.y
      @z += q.z
      return @

    _subtract: (q) ->
      @x -= q.x
      @y -= q.y
      @z -= q.z
      return @

    _cross: (q) ->
      r = POINT_CACHE
      r.x = @y * q.z - @z * q.y
      r.y = @z * q.x - @x * q.z
      r.z = @x * q.y - @y * q.x

      @set(r)
      return @

    toJSON: () ->
      return [@x, @y, @z, @w]

  Points = {
    X    : new Point(1, 0, 0)
    Y    : new Point(0, 1, 0)
    Z    : new Point(0, 0, 1)
    EYE  : new Point(0, 0, -1)
    ZERO : new Point(0, 0, 0)
  }

  POINT_CACHE = new Point()

  seen.Matrix = Matrix
  seen.Point = Point
  seen.Points = Points
  seen.Transformable = Transformable
