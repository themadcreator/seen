# The `Bounds` object contains an axis-aligned bounding box.
class seen.Bounds

  @points : (points) ->
    box = new seen.Bounds()
    box.add(p) for p in points
    return box

  @xywh : (x, y, w, h) ->
    return seen.Boundses.xyzwhd(x, y, 0, w, h, 0)

  @xyzwhd : (x, y, z, w, h, d) ->
    box = new seen.Bounds()
    box.add(seen.P(x, y, z))
    box.add(seen.P(x+w, y+h, z+d))
    return box

  constructor : () ->
    @min = null
    @max = null

  # Creates a copy of this box object with the same bounds
  copy : () ->
    box = new seen.Bounds()
    box.min = @min?.copy()
    box.max = @max?.copy()
    return box

  # Adds this point to the bounding box, extending it if necessary
  add : (p) ->
    if not (@min? and @max?)
      @min = p.copy()
      @max = p.copy()
    else
      @min.x = Math.min(@min.x, p.x)
      @min.y = Math.min(@min.y, p.y)
      @min.z = Math.min(@min.z, p.z)

      @max.x = Math.max(@max.x, p.x)
      @max.y = Math.max(@max.y, p.y)
      @max.z = Math.max(@max.z, p.z)
    return @

  # Returns true of this box contains at least one point
  valid : ->
    return (@min? and @max?)

  # Trims this box so that it results in the intersection of this box and the
  # supplied box.
  intersect : (box) ->
    if not @valid() or not box.valid()
      @min = null
      @max = null
    else
      @min = seen.P(
        Math.max(@min.x, box.min.x)
        Math.max(@min.y, box.min.y)
        Math.max(@min.z, box.min.z)
      )
      @max = seen.P(
        Math.min(@max.x, box.max.x)
        Math.min(@max.y, box.max.y)
        Math.min(@max.z, box.max.z)
      )
      if @min.x > @max.x or @min.y > @max.y or @min.z > @max.z
        @min = null
        @max = null
    return @


  # Pads the min and max of this box using the supplied x, y, and z
  pad : (x, y, z) ->
    if @valid()
      y ?= x
      z ?= y
      p  = seen.P(x,y,z)
      @min.subtract(p)
      @max.add(p)
    return @

  # Returns this bounding box to an empty state
  reset : () ->
    @min = null
    @max = null
    return @

  # Return true iff the point p lies within this bounding box. Points on the
  # edge of the box are included.
  contains : (p) ->
    if not @valid()
      return false
    else if @min.x > p.x or @max.x < p.x
      return false
    else if @min.y > p.y or @max.y < p.y
      return false
    else if @min.z > p.z or @max.z < p.z
      return false
    else
      return true

  # Returns the center of the box or zero if no points are in the box
  center : () ->
    return seen.P(
      @minX() + @width()/2
      @minY() + @height()/2
      @minZ() + @depth()/2
    )

  # Returns the width (x extent) of the box
  width  : () => @maxX() - @minX()

  # Returns the height (y extent) of the box
  height : () => @maxY() - @minY()

  # Returns the depth (z extent) of the box
  depth  : () => @maxZ() - @minZ()

  minX : () => return @min?.x ? 0
  minY : () => return @min?.y ? 0
  minZ : () => return @min?.z ? 0

  maxX : () => return @max?.x ? 0
  maxY : () => return @max?.y ? 0
  maxZ : () => return @max?.z ? 0
