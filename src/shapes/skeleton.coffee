# ## Skeletons
# #### Articulated skeleton shape groups
# ------------------

seen.Skeletons = {
  joints: (n, unitshape) ->
    unitshape ?= @unitcube
    g = new seen.Group
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
}