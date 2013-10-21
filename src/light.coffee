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
    super
    seen.Util.defaults(@, options, @defaults)
    @id = 'l' + seen.Util.uniqueId()

  render : ->
    @colorIntensity = @color.scale(@intensity)

seen.Lights = {
  point       : (opts) -> new seen.Light 'point', opts
  directional : (opts) -> new seen.Light 'directional', opts
  ambient     : (opts) -> new seen.Light 'ambient', opts
}
