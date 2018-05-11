import * as React from "react";
import {
    Colors,
    Context,
    Drag,
    IDragEvent,
    Model,
    Models,
    Quaternion,
    Scene,
    Shape,
    Shapes,
    Simplex3D,
    Viewports
} from "seen";

export interface IBasicSceneDemoProps {
    width: number;
    height: number;
    model: Model;
    dragRotate?: boolean;
    onAnimate?: (t: number, dt: number) => void;
}

export class BasicSceneDemo extends React.PureComponent<IBasicSceneDemoProps> {
    public static defaultProps: Partial<IBasicSceneDemoProps> = {
        dragRotate: false,
    };

    private canvas: HTMLCanvasElement;

    public render() {
        const { width, height } = this.props;
        return (
            <div style={{ display: "inline-block", background: "#555", borderRadius: 5 }}>
                <canvas width={width} height={height} ref={(ref) => this.canvas = ref} />
            </div>
        );
    }

    public componentDidMount() {
        const { width, height, model, onAnimate, dragRotate } = this.props

        const scene = new Scene({
            model: Models.default().add(model),
            viewport: Viewports.center(width, height),
        });

        const context = Context(this.canvas, scene).render();

        if (onAnimate) {
            context.animate().onBefore(onAnimate).start();
        }

        if (dragRotate) {
            const dragger = new Drag(this.canvas, { inertia: true })
            dragger.on("drag", (e: IDragEvent) => {
                const [x, y] = e.offsetRelative;
                const xform = Quaternion.xyToTransform(x, y);
                model.transform(xform);
                context.render();
            });
        }
    }
}

export const SceneDemoSphere = () => {
    const sphere = Shapes.sphere(2).scale(0.4);
    Colors.randomSurfaces2(sphere);
    const shapes = new Model().scale(400).add(sphere);
    const onAnimate = (t: number, dt: number) => shapes.rotx(dt * 1e-4).roty(0.7 * dt * 1e-4)

    return (
        <BasicSceneDemo
            width={400}
            height={400}
            model={shapes}
            onAnimate={onAnimate}
            dragRotate={true}
        />
    );
}

export const SceneDemoTetra = () => {
    const tetra = Shapes.tetrahedron().scale(0.2);
    Colors.randomSurfaces2(tetra);
    const shapes = new Model().scale(400).add(tetra);

    return (
        <BasicSceneDemo
            width={400}
            height={400}
            model={shapes}
            dragRotate={true}
        />
    );
}

export const SceneDemoWavePatch = () => {
    const width = 400;
    const height = 400;

    const equilateralAltitude = Math.sqrt(3.0) / 2.0;
    const triangleScale = 40;
    const patchWidth = width * 1.5;
    const patchHeight = height * 1.5;

    // Create patch of triangles that spans the view
    const shape = Shapes.patch(
            patchWidth / triangleScale / equilateralAltitude,
            patchHeight / triangleScale,
        )
        .scale(triangleScale)
        .translate(-patchWidth / 2, -patchHeight / 2 + 80, 0)
        .rotx(-0.3)

    Colors.randomSurfaces2(shape)
    const model = new Model().add(shape);

    // Apply animated 3D simplex noise to patch vertices
    const noiser = new Simplex3D();
    const onAnimate = (t: number) => {
        for (const surf of shape.surfaces) {
            for (const p of surf.points) {
                p.z = 4 * noiser.noise(p.x / 8, p.y / 8, t * 1e-4)
            }

            // Since we're modifying the point directly, we need to mark the
            // surface dirty to make sure the cache doesn't ignore the change
            surf.dirty = true;
        }
    }

    return (
        <BasicSceneDemo
            width={400}
            height={400}
            model={model}
            onAnimate={onAnimate}
        />
    );
}



