
class seen.MocapModel
  constructor : (@model, @frames, @frameDelay) ->

  applyFrameTransforms : (frameIndex) ->
    frame = @frames[frameIndex]
    for transform in frame
      transform.shape.reset().transform(transform.transform)
    return (frameIndex + 1) % @frames.length


class seen.MocapAnimator extends seen.Animator
  constructor : (@mocap) ->
    super
    @frameIndex = 0
    @frameDelay = @mocap.frameDelay
    @onFrame(@renderFrame)

  renderFrame : =>
    @frameIndex = @mocap.applyFrameTransforms(@frameIndex)


class seen.Mocap
  @DEFAULT_SHAPE_FACTORY : (joint, endpoint) ->
    return seen.Shapes.pipe(seen.P(), endpoint)

  @parse : (source) ->
    return new seen.Mocap(seen.BvhParser.parse(source))

  constructor : (@bvh) ->

  createMocapModel : (shapeFactory = seen.Mocap.DEFAULT_SHAPE_FACTORY) ->
    model = new seen.Model()
    joints = []
    @_attachJoint(model, @bvh.root, joints, shapeFactory)
    frames = @bvh.motion.frames.map (frame) => @_generateFrameTransforms(frame, joints)
    return new seen.MocapModel(model, frames, @bvh.motion.frameTime * 1000)

  _generateFrameTransforms : (frame, joints) ->
    fi = 0
    transforms = joints.map (joint) =>

      # Apply channel actions in reverse order
      m  = seen.M()
      ai = joint.channels.length
      while ai > 0
        ai -= 1
        @_applyChannelTransform(joint.channels[ai], m, frame[fi + ai])
      fi += joint.channels.length

      # Include offset as final tranform
      m.multiply(joint.offset)

      return {
        shape     : joint.shape
        transform : m
      }

    return transforms

  _applyChannelTransform : (channel, m, v) ->
    switch channel
      when 'Xposition' then m.translate(v, 0, 0)
      when 'Yposition' then m.translate(0, v, 0)
      when 'Zposition' then m.translate(0, 0, v)
      when 'Xrotation' then m.rotx(v * Math.PI / 180.0)
      when 'Yrotation' then m.roty(v * Math.PI / 180.0)
      when 'Zrotation' then m.rotz(v * Math.PI / 180.0)
    return m

  _attachJoint : (model, joint, joints, shapeFactory) ->
    # Save joint offset
    offset = seen.M().translate(
      joint.offset?.x
      joint.offset?.y
      joint.offset?.z
    )
    model.transform(offset)

    # Create channel actions
    if joint.channels?
      joints.push {
        shape    : model
        offset   : offset
        channels : joint.channels
      }

    if joint.joints?
      # Append a model to store the child shapes
      childShapes = model.append()

      for child in joint.joints
        # Generate the child shape with the supplied shape factory
        p = seen.P(child.offset?.x, child.offset?.y, child.offset?.z)
        childShapes.add(shapeFactory(joint, p))

        # Recurse with a new model for any child joints
        if child.type is 'JOINT' then @_attachJoint(childShapes.append(), child, joints, shapeFactory)
    return
