seen = (exports ? this).seen ?= {}

do ->
  class Color
    constructor: (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

    toJSON : ->
      return seen.Colors.toHexRgb(@)

    toHexRgb : ->
      return seen.Colors.toHexRgb(@)

    toStyle : ->
      return seen.Colors.toStyle(@)

  class Colors
    constructor: () ->
      @defaultFill = @fromHsl(0.7, 1.0, 0.5)
      @defaultStroke = null
      @black = new Color(0, 0, 0)
      @white = new Color(0xFF, 0xFF, 0xFF)

    fromRgb: (r, g, b) ->
      return new Color(r, g, b)
  
    fromHex: (hex) ->
      hex = hex.substring(1) if (hex.charAt(0) == '#')
      return new Color(
          parseInt(hex.substring(0, 2), 16),
          parseInt(hex.substring(2, 4), 16),
          parseInt(hex.substring(4, 6), 16))
  
    # h, s, l -> [0.0, 1.0]
    fromHsl: (h, s, l) ->
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

      return new Color(r * 255, g * 255, b * 255)
  
    toHexRgb: (color) ->
      c = (color.r << 16 | color.g << 8 | color.b).toString(16)
      while (c.length < 6)
        c = "0" + c
      return "#" + c

    toStyle: (color) ->
      return "rgba({0},{1},{2},{3})".format(color.r, color.g, color.b, color.a)


  class Light extends seen.Transformable
    constructor: (opts) ->
      seen.Util.defaults(@, opts,
          point     : new seen.Point
          color     : seen.Colors.white
          intensity : 0.01
          exponent  : 8
        )
    
    transform: (m) =>
      @point.transform(m)

  class Phong
    getFaceColor: (lights, surface, color) =>
      c = new Color()

      for light in lights.points
        Lm  = light.point.subtract(surface.barycenter).normalize()
        dot = Lm.dot(surface.normal)

        if (dot > 0)
          # diffuse
          c.r += light.color.r * dot * light.intensity
          c.g += light.color.g * dot * light.intensity
          c.b += light.color.b * dot * light.intensity

          # specular
          Rm       = surface.normal.multiply(dot * 2).subtract(Lm)
          specular = Math.pow(1 + Rm.dot(seen.Points.Z), light.exponent)
          c.r += specular * light.intensity
          c.g += specular * light.intensity
          c.b += specular * light.intensity


      for light in lights.ambients
        c.r += light.color.r * light.intensity
        c.g += light.color.g * light.intensity
        c.b += light.color.b * light.intensity
      
      c.r = Math.min(0xFF, color.r * c.r);
      c.g = Math.min(0xFF, color.g * c.g);
      c.b = Math.min(0xFF, color.b * c.b);
      return c

  seen.Color = Color
  seen.Colors = new Colors
  seen.Light = Light
  seen.Shaders = {}
  seen.Shaders.Phong = Phong

