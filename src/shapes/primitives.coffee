   # ## Shapes
# #### Shape primitives and shape-making methods
# ------------------

# Map to points in the surfaces of a tetrahedron
TETRAHEDRON_COORDINATE_MAP = [
  [0, 2, 1]
  [0, 1, 3]
  [3, 2, 0]
  [1, 2, 3]
]

# Map to points in the surfaces of a cube
CUBE_COORDINATE_MAP = [
  [0, 1, 3, 2] # left
  [5, 4, 6, 7] # right
  [1, 0, 4, 5] # bottom
  [2, 3, 7, 6] # top
  [3, 1, 5, 7] # front
  [0, 2, 6, 4] # back
]

# Map to points in the surfaces of a rectangular pyramid
PYRAMID_COORDINATE_MAP = [
  [1, 0, 2, 3] # bottom
  [0, 1, 4] # left
  [2, 0, 4] # rear
  [3, 2, 4] # right
  [1, 3, 4] # front
]

# Altitude of eqiulateral triangle for computing triangular patch size
EQUILATERAL_TRIANGLE_ALTITUDE = Math.sqrt(3.0) / 2.0

# Points array of an icosahedron
ICOS_X = 0.525731112119133606
ICOS_Z = 0.850650808352039932
ICOSAHEDRON_POINTS = [
  seen.P(-ICOS_X, 0.0,     -ICOS_Z)
  seen.P(ICOS_X,  0.0,     -ICOS_Z)
  seen.P(-ICOS_X, 0.0,     ICOS_Z)
  seen.P(ICOS_X,  0.0,     ICOS_Z)
  seen.P(0.0,     ICOS_Z,  -ICOS_X)
  seen.P(0.0,     ICOS_Z,  ICOS_X)
  seen.P(0.0,     -ICOS_Z, -ICOS_X)
  seen.P(0.0,     -ICOS_Z, ICOS_X)
  seen.P(ICOS_Z,  ICOS_X,  0.0)
  seen.P(-ICOS_Z, ICOS_X,  0.0)
  seen.P(ICOS_Z,  -ICOS_X, 0.0)
  seen.P(-ICOS_Z, -ICOS_X, 0.0)
]

# Map to points in the surfaces of an icosahedron
ICOSAHEDRON_COORDINATE_MAP = [
  [0, 4, 1]
  [0, 9, 4]
  [9, 5, 4]
  [4, 5, 8]
  [4, 8, 1]
  [8, 10, 1]
  [8, 3, 10]
  [5, 3, 8]
  [5, 2, 3]
  [2, 7, 3]
  [7, 10, 3]
  [7, 6, 10]
  [7, 11, 6]
  [11, 0, 6]
  [0, 1, 6]
  [6, 1, 10]
  [9, 0, 11]
  [9, 11, 2]
  [9, 2, 5]
  [7, 2, 11]
]

seen.Shapes = {
  # Returns a 2x2x2 cube, centered on the origin.
  cube: =>
    points = [
      seen.P(-1, -1, -1)
      seen.P(-1, -1,  1)
      seen.P(-1,  1, -1)
      seen.P(-1,  1,  1)
      seen.P( 1, -1, -1)
      seen.P( 1, -1,  1)
      seen.P( 1,  1, -1)
      seen.P( 1,  1,  1)
    ]

    return new seen.Shape('cube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns a 1x1x1 cube from the origin to [1, 1, 1].
  unitcube: =>
    points = [
      seen.P(0, 0, 0)
      seen.P(0, 0, 1)
      seen.P(0, 1, 0)
      seen.P(0, 1, 1)
      seen.P(1, 0, 0)
      seen.P(1, 0, 1)
      seen.P(1, 1, 0)
      seen.P(1, 1, 1)
    ]

    return new seen.Shape('unitcube', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns an axis-aligned 3D rectangle whose boundaries are defined by the
  # two supplied points.
  rectangle : (point1, point2) =>
    compose = (x, y, z) ->
      return seen.P(
        x(point1.x, point2.x)
        y(point1.y, point2.y)
        z(point1.z, point2.z)
      )

    points = [
      compose(Math.min, Math.min, Math.min)
      compose(Math.min, Math.min, Math.max)
      compose(Math.min, Math.max, Math.min)
      compose(Math.min, Math.max, Math.max)
      compose(Math.max, Math.min, Math.min)
      compose(Math.max, Math.min, Math.max)
      compose(Math.max, Math.max, Math.min)
      compose(Math.max, Math.max, Math.max)
    ]

    return new seen.Shape('rect', seen.Shapes.mapPointsToSurfaces(points, CUBE_COORDINATE_MAP))

  # Returns a square pyramid inside a unit cube
  pyramid : =>
    points = [
      seen.P(0, 0, 0)
      seen.P(0, 0, 1)
      seen.P(1, 0, 0)
      seen.P(1, 0, 1)
      seen.P(0.5, 1, 0.5)
    ]

    return new seen.Shape('pyramid', seen.Shapes.mapPointsToSurfaces(points, PYRAMID_COORDINATE_MAP))

  # Returns a tetrahedron that fits inside a 2x2x2 cube.
  tetrahedron: =>
    points = [
      seen.P( 1,  1,  1)
      seen.P(-1, -1,  1)
      seen.P(-1,  1, -1)
      seen.P( 1, -1, -1)]

    return new seen.Shape('tetrahedron', seen.Shapes.mapPointsToSurfaces(points, TETRAHEDRON_COORDINATE_MAP))

  # Returns an icosahedron that fits within a 2x2x2 cube, centered on the
  # origin.
  icosahedron : ->
    return new seen.Shape('icosahedron', seen.Shapes.mapPointsToSurfaces(ICOSAHEDRON_POINTS, ICOSAHEDRON_COORDINATE_MAP))

  # Returns a sub-divided icosahedron, which approximates a sphere with
  # triangles of equal size.
  sphere : (subdivisions = 2) ->
    triangles = ICOSAHEDRON_COORDINATE_MAP.map (coords) -> coords.map (c) -> ICOSAHEDRON_POINTS[c]
    for i in [0...subdivisions]
      triangles = seen.Shapes._subdivideTriangles(triangles)
    return new seen.Shape('sphere', triangles.map (triangle) -> new seen.Surface(triangle.map (v) -> v.copy()))

  # Returns a cylinder whose main axis is aligned from point1 to point2
  pipe : (point1, point2, radius = 1, segments = 8) ->

    # Compute a normal perpendicular to the axis point1->point2 and define the
    # rotations about the axis as a quaternion
    axis  = point2.copy().subtract(point1)
    perp  = axis.perpendicular().multiply(radius)
    theta = -Math.PI * 2.0 / segments
    quat  = seen.Quaternion.pointAngle(axis.copy().normalize(), theta).toMatrix()

    # Apply the quaternion rotations to create one face
    points = [0...segments].map (i) ->
      p = point1.copy().add(perp)
      perp.transform(quat)
      return p

    return seen.Shapes.extrude(points, axis)

  # Returns a planar triangular patch. The supplied arguments determine the
  # number of triangle in the patch.
  patch: (nx = 20, ny = 20) ->
    nx = Math.round(nx)
    ny = Math.round(ny)
    surfaces = []
    for x in [0...nx]
      column = []
      for y in [0...ny]
        pts0 = [
          seen.P(x, y)
          seen.P(x + 1, y - 0.5)
          seen.P(x + 1, y + 0.5)
        ]
        pts1 = [
          seen.P(x, y)
          seen.P(x + 1, y + 0.5)
          seen.P(x, y + 1)
        ]

        for pts in [pts0, pts1]
          for p in pts
            p.x *= EQUILATERAL_TRIANGLE_ALTITUDE
            p.y += if x % 2 is 0 then 0.5 else 0
          column.push pts

      if x % 2 isnt 0
        for p in column[0]
          p.y += ny
        column.push column.shift()
      surfaces = surfaces.concat(column)

    return new seen.Shape('patch', surfaces.map((s) -> new seen.Surface(s)))

  # Return a text surface that can render 3D text using an affine transform estimate of the projection
  text : (text, surfaceOptions = {}) ->
    surface = new seen.Surface(seen.Affine.ORTHONORMAL_BASIS(), seen.Painters.text)
    surface.text = text
    for key, val of surfaceOptions
      surface[key] = val
    return new seen.Shape('text', [surface])

  # Returns a shape that is an extrusion of the supplied points into the z axis.
  extrude : (points, offset) ->
    surfaces = []
    front = new seen.Surface (p.copy() for p in points)
    back  = new seen.Surface (p.add(offset) for p in points)

    for i in [1...points.length]
      surfaces.push new seen.Surface [
        front.points[i - 1].copy()
        back.points[i - 1].copy()
        back.points[i].copy()
        front.points[i].copy()
      ]

    len = points.length
    surfaces.push new seen.Surface [
      front.points[len - 1].copy()
      back.points[len - 1].copy()
      back.points[0].copy()
      front.points[0].copy()
    ]

    back.points.reverse()
    surfaces.push front
    surfaces.push back
    return new seen.Shape('extrusion', surfaces)

  # Returns an extruded block arrow shape.
  arrow : (thickness = 1, tailLength = 1, tailWidth = 1, headLength = 1, headPointiness = 0) ->
    htw = tailWidth/2
    points = [
      seen.P(0, 0, 0)
      seen.P(headLength + headPointiness, 1, 0)
      seen.P(headLength, htw, 0)
      seen.P(headLength + tailLength, htw, 0)
      seen.P(headLength + tailLength, -htw, 0)
      seen.P(headLength, -htw, 0)
      seen.P(headLength + headPointiness, -1, 0)
    ]
    return seen.Shapes.extrude(points, seen.P(0,0,thickness))

  # Returns a shape with a single surface using the supplied points array
  path : (points) ->
    return new seen.Shape('path', [new seen.Surface(points)])

  # Accepts a 2-dimensional array of tuples, returns a shape where the tuples
  # represent points of a planar surface.
  custom : (s) ->
    surfaces = []
    for f in s.surfaces
      surfaces.push new seen.Surface((seen.P(p...) for p in f))
    return new seen.Shape('custom', surfaces)

  # Joins the points into surfaces using the coordinate map, which is an
  # 2-dimensional array of index integers.
  mapPointsToSurfaces : (points, coordinateMap) ->
    surfaces = []
    for coords in coordinateMap
      spts = (points[c].copy() for c in coords)
      surfaces.push(new seen.Surface(spts))
    return surfaces

  # Accepts an array of 3-tuples and returns an array of 3-tuples representing
  # the triangular subdivision of the surface.
  _subdivideTriangles : (triangles) ->
    newTriangles = []
    for tri in triangles
      v01 = tri[0].copy().add(tri[1]).normalize()
      v12 = tri[1].copy().add(tri[2]).normalize()
      v20 = tri[2].copy().add(tri[0]).normalize()
      newTriangles.push [tri[0], v01, v20]
      newTriangles.push [tri[1], v12, v01]
      newTriangles.push [tri[2], v20, v12]
      newTriangles.push [v01,    v12, v20]
    return newTriangles
}
