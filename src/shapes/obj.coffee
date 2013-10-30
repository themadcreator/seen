# Parser for Wavefront .obj files
# NOTE: WAVEFRONT OBJ ARRAY INDICES ARE 1-BASED!!!!
class seen.ObjParser
  constructor : () ->
    @vertices = []
    @faces    = []
    @commands =
      v : (data) => @vertices.push data.map (d) -> parseFloat(d)
      f : (data) => @faces.push data.map (d) -> parseInt(d)

  parse : (contents) ->
    for line in contents.split(/[\r\n]+/)
      data = line.trim().split(/[ ]+/)

      # Check data
      if data.length < 2
        continue

      command = data.slice(0,1)[0]
      data    = data.slice(1)

      # Check command
      if command.charAt(0) is '#'
        continue
      if not @commands[command]?
        console.log "OBJ Parser: Skipping unknown command '#{command}'"
        continue

      # Execute command
      @commands[command](data)

  mapFacePoints : (faceMap) ->
    @faces.map (face) =>
      points = face.map (v) => seen.P(@vertices[v - 1]...)
      return faceMap.call(@, points)

seen.Shapes.obj = (objContents, cullBackfaces = true) ->
  parser = new seen.ObjParser()
  parser.parse(objContents)
  return new seen.Shape('obj', parser.mapFacePoints((points) ->
    surface = new seen.Surface points
    surface.cullBackfaces = cullBackfaces
    return surface
  ))
