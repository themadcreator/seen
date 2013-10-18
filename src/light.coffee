# ## Lighting
# #### Lights and various shaders
# ------------------

# This model object holds the attributes and transformation of a light source.
class seen.Light extends seen.Transformable
  defaults :
    point     : seen.P()
    color     : seen.C.white
    intensity : 0.01
    normal    : seen.P(1, -1, -1).normalize()

  constructor: (@type, options) ->
    seen.Util.defaults(@, options, @defaults)

  render : ->
    @colorIntensity = @color.scale(@intensity)

  # TODO - i dont think this works
  transform: (m) =>
    @point.transform(m)

seen.Lights = {
  point       : (opts) -> new seen.Light 'point', opts
  directional : (opts) -> new seen.Light 'directional', opts
  ambient     : (opts) -> new seen.Light 'ambient', opts

  toHash      : (lights) ->
    points       : lights.filter (light) -> light.type is 'point'
    directionals : lights.filter (light) -> light.type is 'directional'
    ambients     : lights.filter (light) -> light.type is 'ambient'
}

seen.ShaderUtils = {
  applyDiffuse : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c._addChannels(light.colorIntensity.scale(dot))

  applyDiffuseAndSpecular : (c, light, lightNormal, surfaceNormal, material) ->
    dot = lightNormal.dot(surfaceNormal)

    if (dot > 0)
      # Apply diffuse phong shading
      c._addChannels(light.colorIntensity.scale(dot))

      # Apply specular phong shading
      eyeNormal         = seen.Points.Z
      reflectionNormal  = surfaceNormal.multiply(dot * 2).subtract(lightNormal)
      specularIntensity = Math.pow(1 + reflectionNormal.dot(eyeNormal), material.specularExponent)
      # TODO scale by specular color from material if available
      # specularColor     = seen.C.white #material.specularColor ? seen.C.white
      # c._addChannels(specularColor.scale(specularIntensity * light.intensity))
      c._offset(specularIntensity * light.intensity)

  applyAmbient : (c, light) ->
    # Apply ambient shading
    c._addChannels(light.colorIntensity)
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

    for light in lights.points
      lightNormal = light.point.subtract(renderModel.barycenter).normalize()
      seen.ShaderUtils.applyDiffuseAndSpecular(c, light, lightNormal, renderModel.normal, material)

    for light in lights.directionals
      seen.ShaderUtils.applyDiffuseAndSpecular(c, light, light.normal, renderModel.normal, material)

    for light in lights.ambients
      seen.ShaderUtils.applyAmbient(c, light)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `DiffusePhong` shader implements the Phong shading model with a diffuse and ambient term (no specular).
class DiffusePhong extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights.points
      lightNormal = light.point.subtract(renderModel.barycenter).normalize()
      seen.ShaderUtils.applyDiffuse(c, light, lightNormal, renderModel.normal, material)

    for light in lights.directionals
      seen.ShaderUtils.applyDiffuse(c, light, light.normal, renderModel.normal, material)

    for light in lights.ambients
      seen.ShaderUtils.applyAmbient(c, light)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
    return c

# The `Ambient` shader colors surfaces from ambient light only.
class Ambient extends seen.Shader
  shade: (lights, renderModel, material) ->
    c = new seen.Color()

    for light in lights.ambients
      seen.ShaderUtils.applyAmbient(c, light)

    c._multiplyChannels(material.color)._clamp(0, 0xFF)
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
