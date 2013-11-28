
# `Color` objects store RGB and Alpha values from 0 to 255.
class seen.Color
  constructor: (@r = 0, @g = 0, @b = 0, @a = 0xFF) ->

  # Returns a new `Color` object with the same rgb and alpha values as the current object
  copy: () ->
    return new seen.Color(@r, @g, @b, @a)

  # Scales the rgb channels by the supplied scalar value.
  scale: (n) ->
    @r *= n
    @g *= n
    @b *= n
    return @

  # Offsets each rgb channel by the supplied scalar value.
  offset: (n) ->
    @r += n
    @g += n
    @b += n
    return @

  # Clamps each rgb channel to the supplied minimum and maximum scalar values.
  clamp: (min = 0, max = 0xFF) ->
    @r = Math.min(max, Math.max(min, @r))
    @g = Math.min(max, Math.max(min, @g))
    @b = Math.min(max, Math.max(min, @b))
    return @

  # Adds the channels of the current `Color` with each respective channel from the supplied `Color` object.
  addChannels: (c) ->
    @r += c.r
    @g += c.g
    @b += c.b
    return @

  # Multiplies the channels of the current `Color` with each respective channel from the supplied `Color` object.
  multiplyChannels: (c) ->
    @r *= c.r
    @g *= c.g
    @b *= c.b
    return @

  # Converts the `Color` into a hex string of the form "#RRGGBB".
  hex: () ->
    c = (@r << 16 | @g << 8 | @b).toString(16)
    while (c.length < 6) then c = '0' + c
    return '#' + c

  # Converts the `Color` into a CSS-style string of the form "rgba(RR, GG, BB, AA)"
  style: () ->
    return "rgba(#{@r},#{@g},#{@b},#{@a})"

seen.Colors = {
  # Creates a new `Color` using the supplied rgb and alpha values.
  #
  # Each value must be in the range [0, 255] or, equivalently, [0x00, 0xFF].
  rgb: (r, g, b, a = 255) ->
    return new seen.Color(r, g, b, a)

  # Creates a new `Color` using the supplied hex string of the form "#RRGGBB".
  hex: (hex) ->
    hex = hex.substring(1) if (hex.charAt(0) == '#')
    return new seen.Color(
        parseInt(hex.substring(0, 2), 16),
        parseInt(hex.substring(2, 4), 16),
        parseInt(hex.substring(4, 6), 16))

  # Creates a new `Color` using the supplied hue, saturation, and lightness (HSL) values.
  #
  # Each value must be in the range [0.0, 1.0].
  hsl: (h, s, l, a = 1) ->
    r = g = b = 0
    if (s == 0)
      # When saturation is 0, the color is "achromatic" or "grayscale".
      r = g = b = l
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

    return new seen.Color(r * 255, g * 255, b * 255, a * 255)

  randomSurfaces : (shape, sat = 0.5, lit = 0.4) ->
    for surface in shape.surfaces
      surface.fill = new seen.Material seen.Colors.hsl(Math.random(), sat, lit)

  randomSurfaces2 : (shape, drift = 0.03, sat = 0.5, lit = 0.4) ->
    hue = Math.random()
    for surface in shape.surfaces
      hue += (Math.random() - 0.5) * drift
      if hue < 0 then hue = 1
      if hue > 1 then hue = 0
      surface.fill = new seen.Material seen.Colors.hsl(hue, 0.5, 0.4)

  randomShape : (shape, sat = 0.5, lit = 0.4) ->
    shape.fill new seen.Material seen.Colors.hsl(Math.random(), sat, lit)

  # A few `Color`s are supplied for convenience.
  black : -> @hex('#000000')
  white : -> @hex('#FFFFFF')
  gray  : -> @hex('#888888')
}

# Convenience constructor.
seen.C = (r,g,b,a) -> new seen.Color(r,g,b,a)

