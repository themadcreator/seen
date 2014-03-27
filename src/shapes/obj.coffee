# Parser for Wavefront .obj files
# 
# Note: Wavefront .obj array indicies are 1-based.
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

      continue if data.length < 2 # Check line parsing

      command = data.slice(0,1)[0]
      data    = data.slice(1)
      
      if command.charAt(0) is '#' # Check for comments
        continue
      if not @commands[command]? # Check that we know how the handle this command
        console.log "OBJ Parser: Skipping unknown command '#{command}'"
        continue

      @commands[command](data) # Execute command

  mapFacePoints : (faceMap) ->
    @faces.map (face) =>
      points = face.map (v) => seen.P(@vertices[v - 1]...)
      return faceMap.call(@, points)

# This method accepts Wavefront .obj file content and returns a `Shape` object.
seen.Shapes.obj = (objContents, cullBackfaces = true) ->
  parser = new seen.ObjParser()
  parser.parse(objContents)
  return new seen.Shape('obj', parser.mapFacePoints((points) ->
    surface = new seen.Surface points
    surface.cullBackfaces = cullBackfaces
    return surface
  ))
