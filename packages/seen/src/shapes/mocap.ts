/*
 * decaffeinate suggestions:
 * DS001: Remove Babel/TypeScript constructor workaround
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */

seen.MocapModel = class MocapModel {
    constructor(model, frames, frameDelay) {
        this.model = model;
        this.frames = frames;
        this.frameDelay = frameDelay;
    }

    applyFrameTransforms(frameIndex) {
        const frame = this.frames[frameIndex];
        for (let transform of Array.from(frame)) {
            transform.shape.reset().transform(transform.transform);
        }
        return (frameIndex + 1) % this.frames.length;
    }
};

seen.MocapAnimator = class MocapAnimator extends seen.Animator {
    constructor(mocap) {
        {
            // Hack: trick Babel/TypeScript into allowing this before super.
            if (false) {
                super();
            }
            let thisFn = (() => {
                this;
            }).toString();
            let thisName = thisFn.slice(thisFn.indexOf("{") + 1, thisFn.indexOf(";")).trim();
            eval(`${thisName} = this;`);
        }
        this.renderFrame = this.renderFrame.bind(this);
        this.mocap = mocap;
        super(...arguments);
        this.frameIndex = 0;
        this.frameDelay = this.mocap.frameDelay;
        this.onFrame(this.renderFrame);
    }

    renderFrame() {
        return (this.frameIndex = this.mocap.applyFrameTransforms(this.frameIndex));
    }
};

seen.Mocap = class Mocap {
    static DEFAULT_SHAPE_FACTORY(joint, endpoint) {
        return seen.Shapes.pipe(seen.P(), endpoint);
    }

    static parse(source) {
        return new seen.Mocap(seen.BvhParser.parse(source));
    }

    constructor(bvh) {
        this.bvh = bvh;
    }

    createMocapModel(shapeFactory) {
        if (shapeFactory == null) {
            shapeFactory = seen.Mocap.DEFAULT_SHAPE_FACTORY;
        }
        const model = new seen.Model();
        const joints = [];
        this._attachJoint(model, this.bvh.root, joints, shapeFactory);
        const frames = this.bvh.motion.frames.map((frame) => this._generateFrameTransforms(frame, joints));
        return new seen.MocapModel(model, frames, this.bvh.motion.frameTime * 1000);
    }

    _generateFrameTransforms(frame, joints) {
        let fi = 0;
        const transforms = joints.map((joint) => {
            // Apply channel actions in reverse order
            const m = seen.M();
            let ai = joint.channels.length;
            while (ai > 0) {
                ai -= 1;
                this._applyChannelTransform(joint.channels[ai], m, frame[fi + ai]);
            }
            fi += joint.channels.length;

            // Include offset as final tranform
            m.multiply(joint.offset);

            return {
                shape: joint.shape,
                transform: m,
            };
        });

        return transforms;
    }

    _applyChannelTransform(channel, m, v) {
        switch (channel) {
            case "Xposition":
                m.translate(v, 0, 0);
                break;
            case "Yposition":
                m.translate(0, v, 0);
                break;
            case "Zposition":
                m.translate(0, 0, v);
                break;
            case "Xrotation":
                m.rotx(v * Math.PI / 180.0);
                break;
            case "Yrotation":
                m.roty(v * Math.PI / 180.0);
                break;
            case "Zrotation":
                m.rotz(v * Math.PI / 180.0);
                break;
        }
        return m;
    }

    _attachJoint(model, joint, joints, shapeFactory) {
        // Save joint offset
        const offset = seen
            .M()
            .translate(
                joint.offset != null ? joint.offset.x : undefined,
                joint.offset != null ? joint.offset.y : undefined,
                joint.offset != null ? joint.offset.z : undefined,
            );
        model.transform(offset);

        // Create channel actions
        if (joint.channels != null) {
            joints.push({
                shape: model,
                offset,
                channels: joint.channels,
            });
        }

        if (joint.joints != null) {
            // Append a model to store the child shapes
            const childShapes = model.append();

            for (let child of Array.from(joint.joints)) {
                // Generate the child shape with the supplied shape factory
                const p = seen.P(
                    child.offset != null ? child.offset.x : undefined,
                    child.offset != null ? child.offset.y : undefined,
                    child.offset != null ? child.offset.z : undefined,
                );
                childShapes.add(shapeFactory(joint, p));

                // Recurse with a new model for any child joints
                if (child.type === "JOINT") {
                    this._attachJoint(childShapes.append(), child, joints, shapeFactory);
                }
            }
        }
    }
};
