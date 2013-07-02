seen = (exports ? this).seen ?= {}

do ->
  ###
  Once initialized, this class will have a constant memory footprint
  down to number primitives. Also, we compare each transform and projection
  to prevent unnecessary re-computation.
  ###
  class RenderSurface
    constructor: (@points, @transform, @projection) ->
      @transformed = @_initTransformationSet()
      @projected   = @_initTransformationSet()
      @_update()

    update: (transform, projection) ->
      if @_arraysEqual(transform.m, @transform.m) and @_arraysEqual(projection.m, @projection.m)
        return
      else
        @transform = transform
        @projection = projection
        @_update()

    _update: () ->
      @_math(@transformed, @points, @transform, false)
      @_math(@projected, @transformed.points, @projection, true)

    _arraysEqual: (a, b) ->
      if not a.length == b.length then return false
      for val, i in a
        if not (val == b[i]) then return false
      return true

    _initTransformationSet: ->
      return {
        points     : (p.copy() for p in @points)
        barycenter : new seen.Point()
        normal     : new seen.Point()
        v0         : new seen.Point()
        v1         : new seen.Point()
      }

    _math: (set, points, transform, applyClip = false) ->
      # Apply transform to points
      for p,i in points
        sp = set.points[i]
        sp.set(p).transform(transform)
        if applyClip then sp._divide(sp.w)

      # Compute barycenter
      set.barycenter.set(seen.Points.ZERO)
      for p in set.points
        set.barycenter._add(p)
      set.barycenter._divide(set.points.length)

      # Compute normal
      set.v0.set(set.points[1])._subtract(set.points[0])
      set.v1.set(set.points[points.length - 1])._subtract(set.points[0])
      set.normal.set(set.v0._cross(set.v1)._normalize())

  seen.PathPainter = {
    paint : (surface, render, canvas) ->
      canvas.path()
        .path(render.projected.points)
        .style(
          fill   : if not render.fill?   then 'none' else seen.Colors.toHexRgb(render.fill)
          stroke : if not render.stroke? then 'none' else seen.Colors.toHexRgb(render.stroke)
        )
  }

  seen.TextPainter = {
    paint : (surface, render, canvas) ->
      canvas.text()
        .text(surface.text)
        .transform(render.transform.multiply render.projection)
        .style(
          fill   : if not render.fill?   then 'none' else seen.Colors.toHexRgb(render.fill)
          stroke : if not render.stroke? then 'none' else seen.Colors.toHexRgb(render.stroke)
        )
  }

  class Surface
    ignoreBackfaceCulling : false

    constructor: (@points, @painter = seen.PathPainter) ->
      @fill = seen.Colors.white

    getRenderSurface: (transform, projection) ->
      if not @render? 
        @render = new RenderSurface(@points, transform, projection)
      else
        @render.update(transform, projection)
      return @render

  class Shape extends seen.Transformable
    constructor: (@type, @surfaces) ->
      super()

    eachSurface: (f) ->
      @surfaces.forEach(f)
      return @

    fill: (fill) ->
      @eachSurface (s) -> s.fill = fill
      return @

    stroke: (stroke) ->
      @eachSurface (s) -> s.stroke = stroke
      return @

    toJSON: () =>
      if @type == 'custom'
        return {
          type       : @type
          transforms : [['matrix', @m.m]]
          surfaces   : ((p.toJSON() for p in surface.points) for surface in @surfaces)
        }
      else
        return {
          type       : @type
          transforms : [['matrix', @m.m]]
        }

  class Group extends seen.Transformable
    constructor: () ->
      super()
      @children = []

    add: (child) ->
      @children.push child
      return @

    append: () ->
      group = new Group
      @add group
      return group

    eachShape: (f) ->
      for child in @children
        if child instanceof Shape
          f.call(@, child)
        if child instanceof Group
          child.eachTransformedShape(f)

    eachTransformedShape: (f, m = null) ->
      m ?= @m
      for child in @children
        if child instanceof Shape
          f.call(@, child, child.m.multiply(m))
        if child instanceof Group
          child.eachTransformedShape(f, child.m.multiply(m))

  seen.Shapes = {
    _cubeCoordinateMap : [
      [0,1,3,2] # left
      [5,4,6,7] # right
      [1,0,4,5] # bottom
      [2,3,7,6] # top
      [3,1,5,7] # front
      [0,2,6,4] # back
    ]

    _mapPointsToSurfaces: (points, coordinateMap) ->
      surfaces = []
      for coords in coordinateMap
        spts = (points[c].copy() for c in coords)
        surfaces.push(new Surface(spts))
      return surfaces

    joints: (n, unitshape) ->
      unitshape ?= @unitcube
      g = new Group
      joints = []
      for i in [0...n]
        joints.push g
        g = g.append()
          .translate(-0.5, -1, -0.5)
          .add(unitshape())
          .append()
          .translate(0.5, 0, 0.5)
          .append()

      return joints

    bipedSkeleton: (unitshape) =>

      #               H
      #               |
      #  FA - E - A - B - A - E - FA
      #               |
      #               P
      #              / \
      #              L L
      #              | |
      #              K K
      #              | |
      #              C C
      #              | |
      #              F F

      unitshape ?= @unitcube

      makeSkeleton = () =>
        joints = @joints(3, unitshape)
        return {
          upperBody : joints[0]
          torso     : joints[1]
          pelvis    : joints[2]
        }

      makeArm = () =>
        joints = @joints(4, unitshape)
        return {
          shoulder : joints[0]
          upperArm : joints[1]
          elbow    : joints[2]
          foreArm  : joints[3]
        }

      makeLeg = () =>
        joints = @joints(4, unitshape)
        return {
          upperLeg : joints[0]
          knee     : joints[1]
          lowerLeg : joints[2]
          foot     : joints[3]
        }

      attachSideJoint = (rootjoint, joint, x) =>
        s = rootjoint
          .append()
          .translate(x)
          .append()
        s.append()
          .translate(x)
          .add(joint)
        return s

      skeleton          = makeSkeleton()
      skeleton.root     = skeleton.upperBody
      skeleton.leftArm  = makeArm()
      skeleton.rightArm = makeArm()
      skeleton.leftLeg  = makeLeg()
      skeleton.rightLeg = makeLeg()

      skeleton.leftShoulder  = attachSideJoint(skeleton.upperBody, skeleton.leftArm.shoulder, 0.5)
      skeleton.rightShoulder = attachSideJoint(skeleton.upperBody, skeleton.rightArm.shoulder, -0.5)
      skeleton.leftHip       = attachSideJoint(skeleton.pelvis, skeleton.leftLeg.upperLeg, 0.5)
      skeleton.rightHip      = attachSideJoint(skeleton.pelvis, skeleton.rightLeg.upperLeg, -0.5)

      return skeleton

    cube: =>
      points = [
        new seen.Point(-1, -1, -1)
        new seen.Point(-1, -1,  1)
        new seen.Point(-1,  1, -1)
        new seen.Point(-1,  1,  1)
        new seen.Point( 1, -1, -1)
        new seen.Point( 1, -1,  1)
        new seen.Point( 1,  1, -1)
        new seen.Point( 1,  1,  1)
      ]

      return new Shape('cube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))

    unitcube: =>
      points = [
        new seen.Point(0, 0, 0)
        new seen.Point(0, 0, 1)
        new seen.Point(0, 1, 0)
        new seen.Point(0, 1, 1)
        new seen.Point(1, 0, 0)
        new seen.Point(1, 0, 1)
        new seen.Point(1, 1, 0)
        new seen.Point(1, 1, 1)
      ]

      return new Shape('unitcube', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))


    rectangle : (point1, point2) =>
      compose = (x, y, z) ->
        return new seen.Point(
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

      return new Shape('rect', seen.Shapes._mapPointsToSurfaces(points, seen.Shapes._cubeCoordinateMap))


    tetrahedron: =>
      points = [
        new seen.Point( 1,  1,  1)
        new seen.Point(-1, -1,  1)
        new seen.Point(-1,  1, -1)
        new seen.Point( 1, -1, -1)]

      coordinateMap = [
        [0,2,1]
        [0,1,3]
        [3,2,0]
        [1,2,3]]

      return new Shape('tetrahedron', seen.Shapes._mapPointsToSurfaces(points, coordinateMap))

    text: (text) ->
      surface = new Surface([
        new seen.Point(0,0,-1)
        new seen.Point(0,20,-1)
        new seen.Point(20,0,-1)
      ], seen.TextPainter)
      surface.text = text
      surface.ignoreBackfaceCulling = true
      return new Shape('text', [surface])

    custom: (s) ->
      surfaces = []
      for f in s.surfaces
        surfaces.push new Surface((new seen.Point(p...) for p in f))
      return new Shape('custom', surfaces)

    fromJSON: (s) ->
      shape = @[s.type](s)
      for xform in s.transforms
        shape[xform[0]].call(shape, xform.slice(1)...)
      return shape
  }

  seen.RenderSurface = RenderSurface
  seen.Group = Group
  seen.Surface = Surface
  seen.Shape = Shape