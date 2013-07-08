# ## Materials
# #### Colors and surface-material properties used by shaders.
# ***


class seen.Color
  constructor: (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

  hex: () ->
    c = (@r << 16 | @g << 8 | @b).toString(16)
    while (c.length < 6) then c = '0' + c
    return '#' + c

  style: () ->
    return "rgba(#{@r},#{@g},#{@b},#{@a})"

seen.Colors = {
  rgb: (r, g, b, a) ->
    return new seen.Color(r, g, b, a)

  hex: (hex) ->
    hex = hex.substring(1) if (hex.charAt(0) == '#')
    return new seen.Color(
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16))

  # h, s, l -> [0.0, 1.0]
  hsl: (h, s, l) ->
    r = g = b = 0
    if (s == 0)
      r = g = b = l # achromatic
    else 
      hue2rgb = (p, q, t) ->
        if (t < 0) 
          t += 1
         else if (t > 1) 
          t -= 1
        
        if (t < 1 / 6) 
          return p + (q - p) * 6 * t
        else if (t < 1 / 2) 
          return q
        else if (t < 2 / 3) 
          return p + (q - p) * (2 / 3 - t) * 6
        else
          return p

      q = if l < 0.5 then l * (1 + s) else l + s - l * s
      p = 2 * l - q
      r = hue2rgb(p, q, h + 1 / 3)
      g = hue2rgb(p, q, h)
      b = hue2rgb(p, q, h - 1 / 3)

    return new seen.Color(r * 255, g * 255, b * 255)
}

seen.C = seen.Colors
seen.C.black = seen.C.hex('#000000')
seen.C.white = seen.C.hex('#FFFFFF')
seen.C.gray  = seen.C.hex('#888888')

class seen.Material
  defaults : 
    color            : seen.C.gray
    specularColor    : seen.C.white
    specularExponent : 8
    shader           : null

  constructor : (@color) ->
    seen.Util.defaults(@, {}, @defaults)

  render : (lights, shader, renderData) ->
    renderShader = @shader ? shader
    return renderShader.shade(lights, renderData, @)
