# ## Lights
# ------------------

# This model object holds the attributes and transformation of a light source.
class seen.Light extends seen.Transformable
  defaults :
    point     : seen.P()
    color     : seen.Colors.white()
    intensity : 0.01
    normal    : seen.P(1, -1, -1).normalize()
    enabled   : true

  constructor: (@type, options) ->
    super
    seen.Util.defaults(@, options, @defaults)
    @id = seen.Util.uniqueId('l')

  render : ->
    @colorIntensity = @color.copy().scale(@intensity)

seen.Lights = {
  # A point light emits light eminating in all directions from a single point.
  # The `point` property determines the location of the point light. Note,
  # though, that it may also be moved through the transformation of the light.
  point       : (opts) -> new seen.Light 'point', opts

  # A directional lights emit light in parallel lines, not eminating from any
  # single point. For these lights, only the `normal` property is used to
  # determine the direction of the light. This may also be transformed.
  directional : (opts) -> new seen.Light 'directional', opts

  # Ambient lights emit a constant amount of light everywhere at once.
  # Transformation of the light has no effect.
  ambient     : (opts) -> new seen.Light 'ambient', opts
}
