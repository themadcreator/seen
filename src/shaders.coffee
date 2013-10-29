
seen.ShaderUtils = {
  applyDiffuse : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot))

  applyDiffuseAndSpecular : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c.addChannels(light.colorIntensity.copy().scale(dot))

      # Apply specular phong shading
      eyeNormal         = seen.Points.Z
      reflectionNormal  = surfaceNormal.copy().multiply(dot * 2).subtract(lightNormal)
      specularIntensity = Math.pow(1 + reflectionNormal.dot(eyeNormal), material.specularExponent)
      # TODO scale by specular color from material if available
      # specularColor     = seen.C.white #material.specularColor ? seen.C.white
      # c._addChannels(specularColor.scale(specularIntensity * light.intensity))
      c.offset(specularIntensity * light.intensity)

  applyAmbient : (c, light) ->
    # Apply ambient shading
    c.addChannels(light.colorIntensity)
}

# The `Shader` class is the base class for all shader objects.
class seen.Shader
  # Every `Shader` implementation must override the `shade` method.
  #
  # `lights` is an object containing the ambient, point, and directional light sources.
  # `renderModel` is an instance of `RenderModel` and contains the transformed and projected surface data.
  # `material` is an instance of `Material` and contains the color and other attributes for determining how light reflects off the surface.
  shade: (lights, renderModel, material) ->
    # Override this

# The `Phong` shader implements the Phong shading model with a diffuse, specular, and ambient term.
#
# See https://en.wikipedia.org/wiki/Phong_reflection_model for more information
class Phong extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'point'
          lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize()
          seen.ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material)
        when 'directional'
          seen.ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material)
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color).clamp(0, 0xFF)
    return c

# The `DiffusePhong` shader implements the Phong shading model with a diffuse and ambient term (no specular).
class DiffusePhong extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'point'
          lightNormal = light.point.copy().subtract(renderModel.barycenter).normalize()
          seen.ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material)
        when 'directional'
          seen.ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material)
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color).clamp(0, 0xFF)
    return c

# The `Ambient` shader colors surfaces from ambient light only.
class Ambient extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights
      switch light.type
        when 'ambient'
          seen.ShaderUtils.applyAmbient(c, light)

    c.multiplyChannels(material.color).clamp(0, 0xFF)
    return c

# The `Flat` shader colors surfaces with the material color, disregarding all light sources.
class Flat extends seen.Shader
  shade: (lights, renderModel, material) ->
    return material.color

seen.Shaders = {
  phong   : new Phong()
  diffuse : new DiffusePhong()
  ambient : new Ambient()
  flat    : new Flat()
}
