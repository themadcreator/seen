# adapted from http://freespace.virgin.net/hugo.elias/models/m_perlin.htm

class Perlin2D
  noise : (x, y) ->
    n = x + y * 57
    n = (n << 13) ^ n
    result = ( 1.0 - ( (n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824.0)

    return result

  smooth : (x, y) ->
    corners = @noise(x - 1, y - 1) + @noise(x + 1, y - 1) + @noise(x - 1, y + 1) + @noise(x + 1, y + 1)
    sides   = @noise(x - 1, y) + @noise(x + 1, y) + @noise(x, y - 1) + @noise(x, y + 1)
    center  = @noise(x, y)
    return corners / 16 + sides / 8 + center / 4

  interpolate : (a, b, t) ->
    f = (1 - Math.cos(Math.PI * t)) * 0.5
    return  a * (1 - f) + b * f

  interpolate2D : (x, y) ->
    ix = Math.floor(x)
    iy = Math.floor(y)
    fx = x - ix
    fy = y - iy

    v0 = @smooth(ix, iy)
    v1 = @smooth(ix + 1, iy)
    v2 = @smooth(ix, iy + 1)
    v3 = @smooth(ix + 1, iy + 1)

    x0 = @interpolate(v0, v1, fx)
    x1 = @interpolate(v2, v3, fx)
    return @interpolate(x0, x1, fy)

  perlin : (x, y) ->
    persistence = 0.2
    octaves     = 4

    accum = 0
    for i in [0..octaves]
      frequency = 1 << i
      amplitude = Math.pow(persistence, i)
      accum += @interpolate2D(x * frequency, y * frequency) * amplitude
    return accum


(this ? exports).Perlin2D = Perlin2D
