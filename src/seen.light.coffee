class seen.Light extends seen.Transformable
  constructor: (opts) ->
    seen.Util.defaults(@, opts,
        point     : seen.P()
        color     : seen.C.white
        intensity : 0.01
      )
  
  transform: (m) =>
    @point.transform(m)

class seen.Shader
  shade: (lights, renderData, material) ->
    # Override this

class Phong extends seen.Shader
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      if (dot > 0)
        # diffuse
        c.r += light.color.r * dot * light.intensity
        c.g += light.color.g * dot * light.intensity
        c.b += light.color.b * dot * light.intensity

        # specular
        Rm       = renderData.normal.multiply(dot * 2).subtract(Lm)
        specular = Math.pow(1 + Rm.dot(seen.Points.Z), material.specularExponent)
        # TODO specular color from material
        c.r += specular * light.intensity
        c.g += specular * light.intensity
        c.b += specular * light.intensity

    for light in lights.ambients
      # ambient
      c.r += light.color.r * light.intensity
      c.g += light.color.g * light.intensity
      c.b += light.color.b * light.intensity
    
    c.r = Math.min(0xFF, material.color.r * c.r);
    c.g = Math.min(0xFF, material.color.g * c.g);
    c.b = Math.min(0xFF, material.color.b * c.b);
    return c

class DiffusePhong extends seen.Shader
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.points
      Lm  = light.point.subtract(renderData.barycenter).normalize()
      dot = Lm.dot(renderData.normal)

      if (dot > 0)
        # diffuse
        c.r += light.color.r * dot * light.intensity
        c.g += light.color.g * dot * light.intensity
        c.b += light.color.b * dot * light.intensity

    for light in lights.ambients
      # ambient
      c.r += light.color.r * light.intensity
      c.g += light.color.g * light.intensity
      c.b += light.color.b * light.intensity
    
    c.r = Math.min(0xFF, material.color.r * c.r);
    c.g = Math.min(0xFF, material.color.g * c.g);
    c.b = Math.min(0xFF, material.color.b * c.b);
    return c

class Ambient extends seen.Shader
  shade: (lights, renderData, material) ->
    c = new seen.Color()

    for light in lights.ambients
      # ambient
      c.r += light.color.r * light.intensity
      c.g += light.color.g * light.intensity
      c.b += light.color.b * light.intensity
    
    c.r = Math.min(0xFF, material.color.r * c.r);
    c.g = Math.min(0xFF, material.color.g * c.g);
    c.b = Math.min(0xFF, material.color.b * c.b);
    return c

class Flat extends seen.Shader
  shade: (lights, renderData, material) ->
    return material.color

seen.Shaders = {
  phong   : new Phong()
  diffuse : new DiffusePhong()
  ambient : new Ambient()
  flat    : new Flat()
}
