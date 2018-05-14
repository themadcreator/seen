import { Points, Point } from "../geometry/point";
import { Bounds } from "../geometry/bounds";
import { Matrix } from "../geometry/matrix";
import { Surface } from "../surface";
import { IViewport } from "../camera";
import { Color } from "../color";
import { Light } from "../light";

// ## RenderModels
// ------------------

const DEFAULT_NORMAL = Points.Z();

export interface IRenderData {
    points: Point[];
    // bounds: Bounds;
    barycenter: Point;
    normal: Point;
    v0: Point;
    v1: Point;
}

// The `RenderModel` object contains the transformed and projected points as
// well as various data needed to shade and paint a `Surface`.
//
// Once initialized, the object will have a constant memory footprint down to
// `Number` primitives. Also, we compare each transform and projection to
// prevent unnecessary re-computation.
//
// If you need to force a re-computation, mark the surface as 'dirty'.
export class RenderModel {
    public points: Point[];
    public transformed: IRenderData;
    public projected: IRenderData;
    public inFrustrum: boolean;

    public fill: Color;
    public stroke: Color;

    constructor(public surface: Surface, public transform: Matrix, public projection: Matrix, public viewport: Matrix) {
        this.points = this.surface.points;
        this.transformed = this._initRenderData();
        this.projected = this._initRenderData();
        this._update();
    }

    public update(transform: Matrix, projection: Matrix, viewport: Matrix) {
        if (
            !this.surface.dirty &&
            transform.equals(this.transform) &&
            projection.equals(this.projection) &&
            viewport.equals(this.viewport)
        ) {
            return;
        } else {
            this.transform = transform;
            this.projection = projection;
            this.viewport = viewport;
            this._update();
        }
    }

    private _update() {
        // Apply model transforms to surface points
        this._math(this.transformed, this.points, this.transform, false);
        // Project into camera space
        const cameraSpace: Point[] = [];
        for(const p of this.transformed.points) {
            cameraSpace.push(p.copy().transform(this.projection))
        }
        this.inFrustrum = this._checkFrustrum(cameraSpace);

        // Project into screen space
        this._math(this.projected, cameraSpace, this.viewport, true);
        return (this.surface.dirty = false);
    }

    private _checkFrustrum(points) {
        // TODO figure out frustrum calculation!!!
        return true;
        // for (let p of points) {
        //    if (p.z > -2) { return true; }
        // }
        // return false;
    }

    private _initRenderData(): IRenderData {
        return {
            points: this.points.map((p) => p.copy()),
            // bounds: new Bounds(),
            barycenter: new Point(),
            normal: new Point(),
            v0: new Point(),
            v1: new Point(),
        };
    }

    private _math(set: IRenderData, points: Point[], transform: Matrix, applyClip = false) {
        // Apply transform to points
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            const sp = set.points[i];
            sp.set(p).transform(transform);
            // Applying the clip is what ultimately scales the x and y coordinates in
            // a perpsective projection
            if (applyClip) {
                sp.divide(sp.w);
            }
        }

        // Compute barycenter, which is used in aligning shapes in the painters
        // algorithm
        set.barycenter.multiply(0);
        for (const p of set.points) {
            set.barycenter.add(p);
        }
        set.barycenter.divide(set.points.length);

        // Compute the bounding box of the points
        // Actually, skip this because it's not used and this is the inner loop!
        // set.bounds.resetTo(set.points);

        // Compute normal, which is used for backface culling (when enabled)
        if (set.points.length < 2) {
            set.v0.set(DEFAULT_NORMAL);
            set.v1.set(DEFAULT_NORMAL);
            return set.normal.set(DEFAULT_NORMAL);
        } else {
            set.v0.set(set.points[1]).subtract(set.points[0]);
            set.v1.set(set.points[points.length - 1]).subtract(set.points[0]);
            return set.normal
                .set(set.v0)
                .cross(set.v1)
                .normalize();
        }
    }
}

// The `LightRenderModel` stores pre-computed values necessary for shading
// surfaces with the supplied `Light`.
export class LightRenderModel {
    public colorIntensity: Color;
    public type: string;
    public intensity: number;
    public point: Point;
    public normal: Point;

    constructor(public light: Light, transform: Matrix) {
        this.light = light;
        this.colorIntensity = light.color.copy().scale(light.intensity);
        this.type = light.type;
        this.intensity = light.intensity;
        this.point = light.point.copy().transform(transform);
        const origin = Points.ZERO().transform(transform);
        this.normal = light.normal
            .copy()
            .transform(transform)
            .subtract(origin)
            .normalize();
    }
}
