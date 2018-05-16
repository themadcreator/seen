import { Light, Lights } from "./light";

import { Colors } from "./color";
import { LightRenderModel } from "./render/model";
import { Matrix } from "./geometry/matrix";
import { Point } from "./geometry/point";
import { Shape } from "./surface";
import { Transformable } from "./transformable";

export type IModelChild = Model | Shape | Light;

export type ILightVisitor = (light: Light, transform: Matrix) => LightRenderModel;

export type IShapeVisitor = (shape: Shape, lights: Light[], transform: Matrix) => void;

/**
 * The object model class. It stores `Shapes`, `Lights`, and other `Models` as
 * well as a transformation matrix.
 *
 * Notably, models are hierarchical, like a tree. This means you can isolate the
 * transformation of groups of shapes in the scene, as well as create chains of
 * transformations for creating, for example, articulated skeletons.
 */
export class Model extends Transformable {
    public children: IModelChild[] = [];
    public lights: Light[] = [];

    /**
     * Add a `Shape`, `Light`, and other `Model` as a child of this `Model`
     * Any number of children can by supplied as arguments.
     */
    public add(...childs: IModelChild[]) {
        for (let child of childs) {
            if (child instanceof Shape || child instanceof Model) {
                this.children.push(child);
            } else if (child instanceof Light) {
                this.lights.push(child);
            }
        }
        return this;
    }

    /**
     * Remove a shape, model, or light from the model. NOTE: the scene may still
     * contain a renderModel in its cache. If you are adding and removing many
     * items, consider calling `.flush()` on the scene to flush its renderModel
     * cache.
     */
    public remove(...childs: IModelChild[]) {
        for (var child of childs) {
            let i: number;
            while ((i = this.children.indexOf(child)) >= 0) {
                this.children.splice(i, 1);
            }
            while ((i = this.lights.indexOf(child as Light)) >= 0) {
                this.lights.splice(i, 1);
            }
        }
        return this;
    }

    /**
     * Create a new child model and return it.
     */
    public append() {
        const model = new Model();
        this.add(model);
        return model;
    }

    /**
     * Visit each `Shape` in this `Model` and all recursive child `Model`s.
     */
    public eachShape(visitor: (shape: Shape) => void) {
        for (let child of this.children) {
            if (child instanceof Shape) {
                visitor.call(this, child);
            }
            if (child instanceof Model) {
                child.eachShape(visitor);
            }
        }
    }

    /**
     * Visit each `Light` and `Shape`, accumulating the recursive transformation
     * matrices along the way. The light callback will be called with each light
     * and its accumulated transform and it should return a `LightModel`. Each
     * shape callback with be called with each shape and its accumulated
     * transform as well as the list of light models that apply to that shape.
     */
    public eachRenderable(lightVisitor: ILightVisitor, shapeVisitor: IShapeVisitor) {
        return this._eachRenderable(lightVisitor, shapeVisitor, [], this.m);
    }

    private _eachRenderable(
        lightVisitor: ILightVisitor,
        shapeVisitor: IShapeVisitor,
        lightModels: LightRenderModel[],
        transform: Matrix,
    ) {
        if (this.lights.length > 0) {
            lightModels = lightModels.slice();
        }
        for (let light of this.lights) {
            if (!light.enabled) {
                continue;
            }
            lightModels.push(lightVisitor.call(this, light, light.m.copy().multiply(transform)));
        }

        for (let child of this.children) {
            if (child instanceof Shape) {
                shapeVisitor.call(this, child, lightModels, child.m.copy().multiply(transform));
            }
            if (child instanceof Model) {
                child._eachRenderable(lightVisitor, shapeVisitor, lightModels, child.m.copy().multiply(transform));
            }
        }
    }
}

export const Models = {
    /**
     * The default model contains standard Hollywood-style 3-part lighting
     */
    default: () => {
        const model = new Model();

        // Key light
        model.add(
            Lights.directional({
                normal: new Point(-1, 1, 1).normalize(),
                color: Colors.hsl(0.1, 0.3, 0.7),
                intensity: 0.004,
            }),
        );

        // Back light
        model.add(
            Lights.directional({
                normal: new Point(1, 1, -1).normalize(),
                intensity: 0.003,
            }),
        );

        // Fill light
        model.add(
            Lights.ambient({
                intensity: 0.0015,
            }),
        );

        return model;
    },
};
