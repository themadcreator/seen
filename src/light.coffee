# ## Lighting
# #### Lights and various shaders
# ------------------


# This model object holds the attributes and transformation of a light source.
class seen.Light extends seen.Transformable
  constructor: (opts) ->
    seen.Util.defaults(@, opts,
        point     : seen.P()
        color     : seen.C.white
        intensity : 0.01
      )

  render : ->
    @colorIntensity = @color.scale(@intensity)
  
  transform: (m) =>
    @point.transform(m)

# The `Shader` class is the base class for all shader objects.
class seen.Shader
  # Every `Shader` implementation must override the `shade` method.
  # 
  # `lights` is an object containing the ambient, point, and directional light sources.
  # `renderData` is an instance of `RenderSurface` and contains the transformed and projected surface data.
  # `material` is an instance of `Material` and contains the color and other attributes for determining how light reflects off the surface.
  shade: (lights, renderData, material) ->
    # Override this

# The `Phong` shader implements the Phong shading model with a diffuse, specular, and ambient term.
#
# See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
class Phong extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      # diffuse and specular
      if (dot > 0)
        c._addChannels(light.colorIntensity.scale(dot))

        Rm                = renderData.normal.multiply(dot * 2).subtract(Lm)
        specularIntensity = Math.pow(1 + Rm.dot(seen.Points.Z), material.specularExponent)
        # TODO scale by specular color from material if available
        # specularColor     = seen.C.white #material.specularColor ? seen.C.white
        # c._addChannels(specularColor.scale(specularIntensity * light.intensity))
        c._offset(specularIntensity * light.intensity)

    for light in lights.ambients
      # ambient
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `DiffusePhong` shader implements the Phong shading model with a diffuse and ambient term (no specular).
class DiffusePhong extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      # diffuse
      if (dot > 0)
        c._addChannels(light.colorIntensity.scale(dot))

    # ambient
    for light in lights.ambients
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `Ambient` shader colors surfaces from ambient light only.
class Ambient extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    # ambient
    for light in lights.ambients
      c._addChannels(light.colorIntensity)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `Flat` shader colors surfaces with the material color, disregarding all light sources.
class Flat extends seen.Shader
  # see `Shader.shade`
  shade: (lights, renderData, material) ->
    return material.color

seen.Shaders = {
  phong   : new Phong()
  diffuse : new DiffusePhong()
  ambient : new Ambient()
  flat    : new Flat()
}
