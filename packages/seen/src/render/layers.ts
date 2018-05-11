import { IRenderLayerContext } from "./context";
import { Scene } from "../scene";

// ## Layers
// ------------------

export interface RenderLayer {
    render: (context: IRenderLayerContext) => void;
}

export class SceneLayer implements RenderLayer {
    constructor(private scene: Scene) {}

    public render(context: IRenderLayerContext) {
        return this.scene.render().map((renderModel) => renderModel.surface.painter.paint(renderModel, context));
    }
}

export class FillLayer implements RenderLayer {
    constructor(private width: number, private height: number, private fill: string) {}

    public render(context: IRenderLayerContext) {
        return context
            .rect()
            .rect(this.width, this.height)
            .fill({ fill: this.fill });
    }
}
