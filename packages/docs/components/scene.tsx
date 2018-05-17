import * as React from "react";

import {
    Body,
    CanvasLayerRenderContext,
    Colors,
    Context,
    Drag,
    GenericSurface,
    IDragEvent,
    IGravitySimulationModel,
    IRenderLayerContext,
    ISphericalBody,
    Model,
    Models,
    Points,
    Quaternion,
    RenderModel,
    Scene,
    Shape,
    Shapes,
    Simplex3D,
    Simulation,
    Surface,
    Viewports,
    generateRandomBodies
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
            cullBackfaces: false,
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
    const sphere = Shapes.sphere(3).scale(0.4);
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

// Define a customer painter to draw circle for gravitational bodies
class BodyPainter {
    public paint(renderModel: RenderModel, context: CanvasLayerRenderContext) {
        // Apply surface's transformation to determine scale.
        const unit       = Points.X().transform(renderModel.transform);
        const scale      = Math.sqrt(unit.dot(unit));

        const body       = renderModel.surface.data as ISphericalBody;
        const radius     = scale * body.radius;
        const massRadius = scale * Math.sqrt(body.mass) * 2;
        const p          = renderModel.projected.points[0];

        // Create radial gradient for painting the surface
        const grd = context.ctx.createRadialGradient(p.x, p.y - (radius*0.5), 0, p.x, p.y - (radius*0.5), radius*2);
        grd.addColorStop(0.2, Colors.white().hex());
        grd.addColorStop(0.5, '#AEF');
        grd.addColorStop(1.0, '#09C');

        // Fill a circle from the body's radius and draw a circle representing its mass
        const painter = context.circle();
        painter.circle(p, radius).fill({
            fill : grd
        });
        return painter.circle(p, massRadius).draw({
            fill   : 'none',
            stroke : '#09C',
        });
    }
}

// Since painters are stateless, we only need one instance
const BODY_PAINTER = new BodyPainter();
class Simulator {
    private simulation: Simulation;

    constructor(
        model: IGravitySimulationModel,
        private seenModel: Model) {
        this.simulation = new Simulation(model);
    }

    public simulate = () => {

        const collisions = this.simulation.simulate();
        for (const collision of collisions) {
            this.seenModel.remove(collision.a.shape);
            this.seenModel.remove(collision.b.shape);
        }

        for (const object of this.simulation.model.objects) {
            // Since we modify the internal points on the surface directly, we
            // need to mark the surface as dirty so that it will be re-rendered
            // properly.
            if (object.shape != null) {
              object.shape.eachSurface(s => s.dirty = true);
            } else {
                const shape = this.toShape(object as Body);
                object.shape = shape;
                this.seenModel.add(shape);
            }
        }
    }

    // Creates a 'body' Shape from a Gravity.Body object
    private toShape(object: Body) {
        const surface = new GenericSurface<ISphericalBody>([object.position], BODY_PAINTER);
        surface.fill = null; // dont bother computing this shading
        surface.data = object;
        return new Shape('body', [surface]);
    }
}

export const SceneDemoGravity = () => {
    const bodyCount = 500;
    const model = {
      objects: generateRandomBodies(bodyCount),
      scale: 1.0,
      ticks: 0,
      collisions: [],
      barnesHutRatio: 0,
    };
    const seenModel = new Model();

    // // Add mouse-rotate
    // const dragger = new Drag('seen-canvas', {inertia : true});
    // dragger.on('drag.rotate', function(e) {
    //   const xform = Quaternion.xyToTransform(...Array.from(e.offsetRelative || []));
    //   return seenModel.transform(xform);
    // });

    // // Add mousewheel-zoom
    // const zoomer = new Zoom('seen-canvas', {smooth : false});
    // zoomer.on('zoom.scale', function(e) {
    //   const xform = M().scale(e.zoom);
    //   return seenModel.transform(xform);
    // });

    // Create a context with a black fill layer and the scene layer
    // TODO update react to allow this
    // const context = Context('seen-canvas');
    // context.layer(new FillLayer(width, height, '#000'));
    // context.sceneLayer(scene);
    // context.animate().start();

    // Run simulator
    const simulator = new Simulator(model, seenModel);
    setInterval(simulator.simulate, 30);

    return (
        <BasicSceneDemo
            width={400}
            height={400}
            model={seenModel}
            dragRotate={true}
            onAnimate={() => 0}
        />
    );
}
