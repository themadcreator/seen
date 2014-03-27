# ## Materials
# #### Surface material properties
# ------------------


# `Material` objects hold the attributes that desribe the color and finish of a surface.
class seen.Material
  defaults :
    # The base color of the material.
    color            : seen.Colors.gray()

    # The `metallic` attribute determines how the specular highlights are
    # calculated. Normally, specular highlights are the color of the light
    # source. If metallic is true, specular highlight colors are determined
    # from the `specularColor` attribute.
    metallic         : false

    # The color used for specular highlights when `metallic` is true.
    specularColor    : seen.Colors.white()

    # The `specularExponent` determines how "shiny" the material is. A low
    # exponent will create a low-intesity, diffuse specular shine. A high
    # exponent will create an intense, point-like specular shine.
    specularExponent : 8

    # A `Shader` object may be supplied to override the shader used for this
    # material. For example, if you want to apply a flat color to text or
    # other shapes, set this value to `seen.Shaders.Flat`.
    shader           : null

  constructor : (@color, options = {}) ->
    seen.Util.defaults(@, options, @defaults)

  # Apply the shader's shading to this material, with the option to override
  # the shader with the material's shader (if defined).
  render : (lights, shader, renderData) ->
    renderShader = @shader ? shader
    color = renderShader.shade(lights, renderData, @)
    color.a = @color.a
    return color
