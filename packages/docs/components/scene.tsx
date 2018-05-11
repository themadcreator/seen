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
    Viewports
    } from "seen";

export interface ISceneDemoProps {
    width: number;
    height: number;
    model: Model;
}

export class SceneDemo extends React.PureComponent<ISceneDemoProps> {
    private canvas: HTMLCanvasElement;

    public render() {
        const { width, height } = this.props;
        return (
            <div style={{display: "inline-block", background: "#555", borderRadius: 5 }}>
                <canvas width={width} height={height} ref={(ref) => this.canvas = ref} />
            </div>
        );
    }

    public componentDidMount() {
        const { width, height, model } = this.props

        // Create scene and add shape to model
        const scene = new Scene({
            model: Models.default().add(model),
            viewport: Viewports.center(width, height),
          });

        // Create render context from canvas
        const context = Context(this.canvas, scene).render();

        // Slowly rotate sphere
        context.animate()
          .onBefore((t, dt) => model.rotx(dt*1e-4).roty(0.7*dt*1e-4))
          .start()

        // Enable drag-to-rotate on the canvas
        const dragger = new Drag(this.canvas, {inertia : true})
        dragger.on("drag", (e: IDragEvent) => {
            const [ x, y ] = e.offsetRelative;
            const xform = Quaternion.xyToTransform(x, y);
            model.transform(xform);
            context.render();
        });

    }
}

export const SceneDemoSphere = () => {
    const sphere = Shapes.sphere(2).scale(0.4);
    Colors.randomSurfaces2(sphere);
    const shapes = new Model().scale(400).add(sphere);
    return <SceneDemo width={400} height={400} model={shapes} />;
}

export const SceneDemoTetra = () => {
    const tetra = Shapes.tetrahedron().scale(0.2);
    Colors.randomSurfaces2(tetra);
    const shapes = new Model().scale(400).add(tetra);
    return <SceneDemo width={400} height={400} model={shapes} />;
}
